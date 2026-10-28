import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createEmbedding } from '@/lib/ai/embeddings';

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  handle: string;
  variants: Array<{
    price: string;
    inventory_quantity?: number;
    title: string;
  }>;
}

interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
}

interface ShopifyPolicy {
  title: string;
  body: string;
  handle: string;
  url?: string;
}

/**
 * Strips HTML tags, scripts, styles and normalizes whitespace
 */
export function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes SHA-256 hash of content to skip re-indexing unchanged documents (PRD Section 10.5)
 */
export function computeContentHash(content: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Chunks text into ~180-word segments with 30-word overlap
 */
export function chunkText(text: string, maxWords: number = 180, overlap: number = 30): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= maxWords) return [words.join(' ')];

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end === words.length) break;
    start += maxWords - overlap;
  }
  return chunks;
}

/**
 * Indexes a single document into `sources` and `chunks` if its SHA-256 hash changed
 */
export async function indexSourceDocument(params: {
  shopId: string;
  type: 'product' | 'page' | 'policy' | 'url' | 'text' | 'pdf' | 'qa';
  title: string;
  url?: string;
  fullContent: string;
}): Promise<{ skipped: boolean; chunksCreated: number; sourceId?: string }> {
  const { shopId, type, title, url, fullContent } = params;
  const contentHash = computeContentHash(fullContent);

  // Check if an identical source with the same hash already exists for this shop
  const { data: existingSource } = await supabaseAdmin
    .from('sources')
    .select('id, content_hash, status')
    .eq('shop_id', shopId)
    .eq('type', type)
    .eq('title', title)
    .maybeSingle();

  if (existingSource && existingSource.content_hash === contentHash && existingSource.status === 'ready') {
    return { skipped: true, chunksCreated: 0, sourceId: existingSource.id };
  }

  // Upsert source record
  const sourcePayload = {
    ...(existingSource?.id ? { id: existingSource.id } : {}),
    shop_id: shopId,
    type,
    title,
    url: url || null,
    status: 'indexing',
    content_hash: contentHash,
    synced_at: new Date().toISOString(),
  };

  const { data: source, error: sourceErr } = await supabaseAdmin
    .from('sources')
    .upsert(sourcePayload)
    .select('id')
    .single();

  if (sourceErr || !source) {
    throw new Error(`Failed to save source ${title}: ${sourceErr?.message}`);
  }

  // Clear old chunks before inserting updated ones
  await supabaseAdmin.from('chunks').delete().eq('source_id', source.id);

  const textChunks = chunkText(fullContent, 180, 30);
  let created = 0;

  for (const chunk of textChunks) {
    try {
      const embedding = await createEmbedding(chunk);
      await supabaseAdmin.from('chunks').insert({
        source_id: source.id,
        shop_id: shopId,
        content: chunk,
        embedding,
        metadata: {
          title,
          url: url || null,
          type,
        },
      });
      created++;
    } catch (err) {
      console.error(`Embedding error on chunk for ${title}:`, err);
    }
  }

  await supabaseAdmin
    .from('sources')
    .update({ status: 'ready', synced_at: new Date().toISOString() })
    .eq('id', source.id);

  return { skipped: false, chunksCreated: created, sourceId: source.id };
}

/**
 * Full Shopify Store Sync: Products (up to 500), Pages, and Store Policies (Requirements B2 & B4)
 */
export async function syncShopifyProducts(
  shopId: string,
  shopifyDomain: string,
  accessToken: string
) {
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  };

  let indexedCount = 0;
  let skippedCount = 0;

  // 1. Fetch & Sync Products (up to 250 per page)
  const productsUrl = `https://${shopifyDomain}/admin/api/2024-01/products.json?limit=250`;
  const prodRes = await fetch(productsUrl, { headers });
  if (prodRes.ok) {
    const { products }: { products: ShopifyProduct[] } = await prodRes.json();
    for (const product of products || []) {
      const cleanedDesc = cleanHtml(product.body_html);
      const variantsSummary = (product.variants || [])
        .map((v) => `${v.title}: $${v.price}${v.inventory_quantity !== undefined ? ` (${v.inventory_quantity} in stock)` : ''}`)
        .join(', ');
      const productUrl = `https://${shopifyDomain}/products/${product.handle}`;
      const fullContent = `Product: ${product.title}\nVariants & Pricing: ${variantsSummary}\nDescription: ${cleanedDesc}`;

      const res = await indexSourceDocument({
        shopId,
        type: 'product',
        title: product.title,
        url: productUrl,
        fullContent,
      });
      if (res.skipped) skippedCount++;
      else indexedCount++;
    }
  }

  // 2. Fetch & Sync Store Pages (/pages.json)
  const pagesUrl = `https://${shopifyDomain}/admin/api/2024-01/pages.json?limit=100`;
  const pagesRes = await fetch(pagesUrl, { headers });
  if (pagesRes.ok) {
    const { pages }: { pages: ShopifyPage[] } = await pagesRes.json();
    for (const page of pages || []) {
      const cleanedBody = cleanHtml(page.body_html);
      if (!cleanedBody) continue;
      const pageUrl = `https://${shopifyDomain}/pages/${page.handle}`;
      const res = await indexSourceDocument({
        shopId,
        type: 'page',
        title: `Page: ${page.title}`,
        url: pageUrl,
        fullContent: `${page.title}\n${cleanedBody}`,
      });
      if (res.skipped) skippedCount++;
      else indexedCount++;
    }
  }

  // 3. Fetch & Sync Store Policies (/policies.json - Refund, Shipping, Privacy, Terms)
  const policiesUrl = `https://${shopifyDomain}/admin/api/2024-01/policies.json`;
  const policiesRes = await fetch(policiesUrl, { headers });
  if (policiesRes.ok) {
    const { policies }: { policies: ShopifyPolicy[] } = await policiesRes.json();
    for (const policy of policies || []) {
      const cleanedPolicy = cleanHtml(policy.body);
      if (!cleanedPolicy) continue;
      const policyUrl = policy.url || `https://${shopifyDomain}/policies/${policy.handle}`;
      const res = await indexSourceDocument({
        shopId,
        type: 'policy',
        title: `Policy: ${policy.title}`,
        url: policyUrl,
        fullContent: `${policy.title}\n${cleanedPolicy}`,
      });
      if (res.skipped) skippedCount++;
      else indexedCount++;
    }
  }

  return {
    success: true,
    indexed: indexedCount,
    skippedUnchanged: skippedCount,
  };
}
