-- ==============================================================================
-- ASKAISLE - SUPABASE INITIAL SCHEMA MIGRATION
-- Enables pgvector, creates 9 core tables, indexes, RPC and RLS policies
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shopify_domain TEXT NOT NULL UNIQUE,
    shopify_token TEXT,
    plan TEXT NOT NULL DEFAULT 'trial',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WIDGETS TABLE
CREATE TABLE IF NOT EXISTS public.widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE UNIQUE,
    public_key TEXT NOT NULL UNIQUE,
    allowed_domains TEXT[] DEFAULT '{}',
    color TEXT NOT NULL DEFAULT '#000000',
    display_name TEXT NOT NULL DEFAULT 'Shop Assistant',
    welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. SOURCES TABLE (Products, Policies, Pages, FAQs)
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('product', 'page', 'policy', 'url', 'text', 'pdf', 'qa')),
    title TEXT NOT NULL,
    url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'indexing', 'ready', 'error')),
    content_hash TEXT,
    error_message TEXT,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CHUNKS TABLE (Indexed embeddings)
CREATE TABLE IF NOT EXISTS public.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- Compatible with OpenAI text-embedding-3-small & Voyage AI
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance & similarity search
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx 
ON public.chunks 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS chunks_shop_id_idx ON public.chunks(shop_id);
CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON public.chunks(source_id);

-- 6. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id UUID NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    visitor_email TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS conversations_shop_id_idx ON public.conversations(shop_id);
CREATE INDEX IF NOT EXISTS conversations_widget_id_idx ON public.conversations(widget_id);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources_used JSONB DEFAULT '[]'::jsonb,
    answered BOOLEAN NOT NULL DEFAULT true,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 6) DEFAULT 0.000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- 8. USAGE_MONTHLY TABLE
CREATE TABLE IF NOT EXISTS public.usage_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- format 'YYYY-MM'
    messages_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(shop_id, month)
);

-- 9. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE UNIQUE,
    provider TEXT NOT NULL DEFAULT 'stripe',
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro')),
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. VECTOR COSINE MATCH FUNCTION
CREATE OR REPLACE FUNCTION match_chunks (
    query_embedding VECTOR(1536),
    filter_shop_id UUID,
    match_threshold FLOAT DEFAULT 0.60,
    match_count INT DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    source_id UUID,
    shop_id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.source_id,
        c.shop_id,
        c.content,
        c.metadata,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM public.chunks c
    WHERE c.shop_id = filter_shop_id
      AND 1 - (c.embedding <=> query_embedding) >= match_threshold
    ORDER BY c.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can manage their own shops"
ON public.shops FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage widgets of their shops"
ON public.widgets FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = widgets.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Users can manage sources of their shops"
ON public.sources FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = sources.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Users can view chunks of their shops"
ON public.chunks FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = chunks.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Users can view conversations of their shops"
ON public.conversations FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = conversations.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Users can view messages of their shops"
ON public.messages FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.conversations
        JOIN public.shops ON shops.id = conversations.shop_id
        WHERE conversations.id = messages.conversation_id AND shops.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can view usage of their shops"
ON public.usage_monthly FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = usage_monthly.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Users can view subscriptions of their shops"
ON public.subscriptions FOR ALL
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = subscriptions.shop_id AND shops.owner_id = auth.uid()));
