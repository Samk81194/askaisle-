import React from 'react';
import Link from 'next/link';
import {
  Bot,
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Trash2,
  ArrowRight,
  FileText,
  Mail,
  Globe,
  CheckCircle2
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* 1. Full Standalone Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1220px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: '#09090B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                }}
              >
                <Bot size={19} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B' }}>
                AskAisle
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                }}
              >
                Legal &amp; Trust Center
              </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Product Overview
              </Link>
              <Link href="/#pricing" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Pricing
              </Link>
              <Link
                href="/privacy"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#2563EB',
                  borderBottom: '2px solid #2563EB',
                  paddingBottom: '2px',
                }}
              >
                Privacy Policy (GDPR)
              </Link>
              <Link href="/terms" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Terms of Service
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" className="btn-outline" style={{ padding: '8px 14px', fontSize: '13px' }}>
              Sign in
            </Link>
            <Link href="/dashboard" className="btn-obsidian" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Merchant Console <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Page Hero Banner + "Privacy at a Glance" Summary Cards */}
      <section className="bg-grid-pattern" style={{ padding: '56px 24px 48px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pill-badge pill-emerald">
                <ShieldCheck size={13} /> GDPR, CCPA &amp; Shopify App Store Compliant
              </span>
              <span className="pill-badge pill-neutral">Version 2.4 · Effective October 28, 2026</span>
            </div>
            <Link href="/terms" style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Terms of Service <ArrowRight size={13} />
            </Link>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#09090B',
              marginBottom: '14px',
            }}
          >
            Privacy Policy &amp; Data Protection (GDPR)
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '760px', lineHeight: 1.6, marginBottom: '36px' }}>
            At AskAisle, we build AI support tools for Shopify merchants with a strict privacy-by-design architecture. We isolate every store&apos;s data at the database row level, never train public foundation models on your customer conversations, and enforce read-only Shopify permissions.
          </p>

          {/* 4 High-Craft Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              {
                icon: Lock,
                title: 'Read-Only Shopify Scope',
                desc: 'We only request read_products and read_content. We never touch orders, checkout cards, or customer passwords.',
              },
              {
                icon: Database,
                title: 'Row-Level Isolation (RLS)',
                desc: 'Every product chunk and chat log is keyed to your unique shop_id and isolated via PostgreSQL Row Level Security.',
              },
              {
                icon: EyeOff,
                title: 'Zero AI Model Training',
                desc: 'Your store catalog and shopper inquiries are never used to train third-party AI models (Anthropic / OpenAI API zero-retention).',
              },
              {
                icon: Trash2,
                title: 'Configurable Auto-Purge',
                desc: 'Set automatic conversation retention (30, 90, or 365 days) or trigger instant erasure via Shopify GDPR webhooks.',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="surface-card" style={{ padding: '20px', background: '#FFFFFF' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#09090B', marginBottom: '6px' }}>{card.title}</h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Two-Column Legal Document Layout (Sticky Table of Contents + Clauses) */}
      <main style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: '56px 24px 88px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '48px', alignItems: 'start' }}>
        {/* Left Sticky Sidebar Navigation */}
        <aside
          className="surface-card"
          style={{
            position: 'sticky',
            top: '88px',
            padding: '20px',
            background: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '12px' }}>
            On This Page
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {[
              { href: '#roles', label: '1. Data Controller & Processor' },
              { href: '#data-collected', label: '2. Categories of Data Collected' },
              { href: '#shopify-permissions', label: '3. Shopify OAuth & Webhooks' },
              { href: '#ai-transparency', label: '4. AI Transparency & RAG Security' },
              { href: '#subprocessors', label: '5. Subprocessors & Hosting' },
              { href: '#retention', label: '6. Retention & Right to Erasure' },
              { href: '#security', label: '7. Encryption & Abuse Prevention' },
              { href: '#contact', label: '8. Data Protection Officer (DPO)' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: '#334155',
                  fontWeight: 500,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: '#64748B' }}>
            <div style={{ fontWeight: 700, color: '#09090B', marginBottom: '4px' }}>Need a signed DPA?</div>
            <p style={{ marginBottom: '10px', lineHeight: 1.4 }}>
              Enterprise and Shopify Plus merchants can request a counter-signed Data Processing Addendum.
            </p>
            <a href="mailto:privacy@askaisle.com" style={{ color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> privacy@askaisle.com
            </a>
          </div>
        </aside>

        {/* Right Column: Detailed Legal Clauses */}
        <div className="surface-card" style={{ padding: '44px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '36px', fontSize: '14.5px', color: '#334155', lineHeight: 1.75 }}>
          <section id="roles">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              1. Data Controller &amp; Data Processor Roles
            </h2>
            <p>
              Under the European Union General Data Protection Regulation (GDPR — Regulation (EU) 2016/679) and equivalent international privacy laws:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong>For Merchant Account Data:</strong> AskAisle Inc. acts as the <strong>Data Controller</strong> for the account registration details (work email, authentication identifier, and billing status) of the Shopify merchant.
              </li>
              <li>
                <strong>For Storefront Visitor Conversations:</strong> The Shopify Merchant acts as the <strong>Data Controller</strong>, and AskAisle acts strictly as the <strong>Data Processor</strong>, processing shopper inquiries and optional follow-up email addresses solely on the Merchant&apos;s behalf.
              </li>
            </ul>
          </section>

          <section id="data-collected">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              2. Categories of Data Collected
            </h2>
            <p style={{ marginBottom: '12px' }}>
              We adhere strictly to the principle of data minimization. AskAisle processes only the following data categories:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, color: '#09090B', marginBottom: '6px' }}>Merchant &amp; Store Data</div>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Account email address &amp; OAuth session</li>
                  <li>Shopify store domain (`*.myshopify.com`)</li>
                  <li>Public product catalog, prices, variants &amp; stock</li>
                  <li>Public store pages, FAQs, and uploaded PDFs</li>
                </ul>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, color: '#09090B', marginBottom: '6px' }}>Storefront Shopper Data</div>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Anonymous session identifier (`visitor_id`)</li>
                  <li>Chat messages submitted inside the widget</li>
                  <li>Optional email address (only when voluntarily provided for unanswered questions)</li>
                  <li>Short-lived IP hash (60 seconds) for abuse rate-limiting</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="shopify-permissions">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              3. Shopify OAuth Scopes &amp; Mandatory Compliance Webhooks
            </h2>
            <p style={{ marginBottom: '14px' }}>
              AskAisle connects via official Shopify OAuth using strictly read-only scopes (`read_products`, `read_content`). In compliance with Shopify App Store requirements, AskAisle implements and verifies HMAC signatures (`X-Shopify-Hmac-Sha256`) on all mandatory privacy webhooks at `/api/webhooks/shopify`:
            </p>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Shopify Webhook Topic</th>
                    <th style={{ padding: '10px 14px' }}>Automated Action Executed by AskAisle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>app/uninstalled</td>
                    <td style={{ padding: '10px 14px' }}>Immediately revokes and wipes `shopify_token` and marks the store inactive.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>customers/data_request</td>
                    <td style={{ padding: '10px 14px' }}>Exports any conversation transcripts matching the requested customer email address.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>customers/redact</td>
                    <td style={{ padding: '10px 14px' }}>Permanently deletes all conversations and messages associated with the customer email.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>shop/redact</td>
                    <td style={{ padding: '10px 14px' }}>Purges all store sources, vector chunks, widgets, and conversation logs 48 hours after uninstallation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="ai-transparency">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              4. AI Transparency &amp; Prompt Injection Safeguards
            </h2>
            <p>
              In accordance with the EU AI Act and GDPR transparency obligations, the AskAisle storefront widget clearly informs visitors in its header that they are interacting with an automated AI assistant. All store content and visitor messages are processed strictly as passive data context, never as system instructions, preventing prompt injection and cross-tenant data leakage.
            </p>
          </section>

          <section id="subprocessors">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              5. Authorized Subprocessors &amp; Infrastructure
            </h2>
            <p style={{ marginBottom: '14px' }}>
              To keep the service fast and reliable, AskAisle relies on five industry-standard infrastructure providers bound by GDPR Standard Contractual Clauses (SCCs):
            </p>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Subprocessor</th>
                    <th style={{ padding: '10px 14px' }}>Role &amp; Purpose</th>
                    <th style={{ padding: '10px 14px' }}>Security &amp; Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Supabase Inc.</td>
                    <td style={{ padding: '10px 14px' }}>PostgreSQL database, Auth &amp; pgvector storage</td>
                    <td style={{ padding: '10px 14px' }}>SOC 2 Type II · AES-256 Encryption</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Anthropic PBC</td>
                    <td style={{ padding: '10px 14px' }}>Claude Haiku LLM response streaming</td>
                    <td style={{ padding: '10px 14px' }}>Zero training on API data · SOC 2</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>OpenAI / Google Cloud</td>
                    <td style={{ padding: '10px 14px' }}>1536-dimensional text embeddings</td>
                    <td style={{ padding: '10px 14px' }}>Zero API data training · TLS 1.3</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Vercel Inc.</td>
                    <td style={{ padding: '10px 14px' }}>Next.js application hosting &amp; Edge CDN</td>
                    <td style={{ padding: '10px 14px' }}>ISO 27001 · SOC 2 Type II</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Resend Inc.</td>
                    <td style={{ padding: '10px 14px' }}>Transactional quota &amp; lead alert emails</td>
                    <td style={{ padding: '10px 14px' }}>GDPR Compliant · DKIM/SPF TLS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="retention">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              6. Data Retention &amp; Your GDPR Rights
            </h2>
            <p>
              Merchants can customize their automatic conversation log retention window (**30 days**, **90 days**, or **365 days**) directly from the Merchant Console under <em>Usage &amp; Subscription</em>. Both Merchants and Storefront Visitors may exercise their rights of access, rectification, portability (CSV/JSON export), and erasure at any time.
            </p>
          </section>

          <section id="security">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              7. Encryption &amp; Abuse Prevention
            </h2>
            <p>
              All traffic between the Shopify storefront widget (`/widget.js`), our Next.js API (`/api/chat`), and our database is encrypted in transit via HTTPS (TLS 1.3) and at rest via AES-256. Public widget endpoints are protected by domain allowlisting (`allowed_domains`), 500-character message caps, and per-IP sliding-window rate limiting.
            </p>
          </section>

          <section id="contact">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              8. Contact &amp; Data Protection Officer
            </h2>
            <p>
              For any privacy inquiry, GDPR data subject request, or security report, please contact our Data Protection team at{' '}
              <a href="mailto:privacy@askaisle.com" style={{ color: '#2563EB', fontWeight: 600 }}>
                privacy@askaisle.com
              </a>
              . We respond to all verified requests within 72 hours.
            </p>
          </section>
        </div>
      </main>

      {/* 4. Full Standalone Footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#09090B',
          color: '#94A3B8',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1220px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={16} color="#09090B" />
            </div>
            <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px' }}>AskAisle</span>
            <span>© 2026 AskAisle Inc. Built for Shopify merchants worldwide.</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', color: '#E2E8F0' }}>
            <Link href="/">Home</Link>
            <Link href="/login">Merchant Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/privacy" style={{ color: '#60A5FA', fontWeight: 600 }}>Privacy Policy (GDPR)</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
