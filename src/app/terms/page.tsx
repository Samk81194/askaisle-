import React from 'react';
import Link from 'next/link';
import {
  Bot,
  FileText,
  CreditCard,
  ShieldCheck,
  Zap,
  RotateCcw,
  ArrowRight,
  Mail,
  CheckCircle2,
  Scale
} from 'lucide-react';

export default function TermsOfServicePage() {
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
              <Link href="/privacy" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Privacy Policy (GDPR)
              </Link>
              <Link
                href="/terms"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#2563EB',
                  borderBottom: '2px solid #2563EB',
                  paddingBottom: '2px',
                }}
              >
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

      {/* 2. Page Hero Banner + Key Commercial Terms Summary Cards */}
      <section className="bg-grid-pattern" style={{ padding: '56px 24px 48px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pill-badge pill-blue">
                <Scale size={13} /> Commercial SaaS Agreement
              </span>
              <span className="pill-badge pill-neutral">Effective Date: October 28, 2026</span>
            </div>
            <Link href="/privacy" style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Privacy Policy (GDPR) <ArrowRight size={13} />
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
            Terms of Service &amp; Merchant Agreement
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '760px', lineHeight: 1.6, marginBottom: '36px' }}>
            Plain-English terms designed for Shopify merchants. No hidden per-conversation fees, no long-term lock-in contracts, and 100% ownership of your store catalog and customer relationships.
          </p>

          {/* 4 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              {
                icon: Zap,
                title: '14-Day Free Trial',
                desc: 'Test AskAisle on your live Shopify store for 14 days (up to 100 AI replies) with no credit card required.',
              },
              {
                icon: CreditCard,
                title: 'Zero Surprise Overages',
                desc: 'Fixed monthly quotas ($19, $39, $79 USD). We never charge automatic per-message overage penalties.',
              },
              {
                icon: RotateCcw,
                title: '2-Click Cancellation',
                desc: 'Cancel anytime from your Merchant Console in 2 clicks. Your bot stays active through the paid billing period.',
              },
              {
                icon: ShieldCheck,
                title: '99.0% Uptime & Fallback',
                desc: 'If an upstream AI provider experiences downtime, the widget automatically switches to email lead capture.',
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
                      background: '#ECFDF5',
                      color: '#059669',
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

      {/* 3. Main Two-Column Legal Document Layout */}
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
            Table of Contents
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {[
              { href: '#acceptance', label: '1. Acceptance of Terms' },
              { href: '#service-scope', label: '2. Service Scope & Shopify App' },
              { href: '#plans-quotas', label: '3. Plans, Quotas & Billing' },
              { href: '#cancellation', label: '4. Cancellation & Refunds' },
              { href: '#ai-accuracy', label: '5. AI Responses & Guardrails' },
              { href: '#acceptable-use', label: '6. Acceptable Use & Fair Play' },
              { href: '#ip-ownership', label: '7. Intellectual Property' },
              { href: '#liability', label: '8. Availability & Liability' },
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
            <div style={{ fontWeight: 700, color: '#09090B', marginBottom: '4px' }}>Billing or Legal Questions?</div>
            <p style={{ marginBottom: '10px', lineHeight: 1.4 }}>
              Our team is available Monday–Friday to assist with billing, custom plans, or compliance.
            </p>
            <a href="mailto:support@askaisle.com" style={{ color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> support@askaisle.com
            </a>
          </div>
        </aside>

        {/* Right Column: Detailed Terms Sections */}
        <div className="surface-card" style={{ padding: '44px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '36px', fontSize: '14.5px', color: '#334155', lineHeight: 1.75 }}>
          <section id="acceptance">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an AskAisle account, connecting a Shopify store via OAuth, or embedding the AskAisle chat widget (`/widget.js`) on your storefront, you (&ldquo;Merchant&rdquo;) agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy" style={{ color: '#2563EB', fontWeight: 600 }}>
                Privacy Policy (GDPR)
              </Link>
              .
            </p>
          </section>

          <section id="service-scope">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              2. Service Scope &amp; Shopify Store Connection
            </h2>
            <p>
              AskAisle provides a Retrieval-Augmented Generation (RAG) customer support widget and merchant dashboard designed for Shopify stores. Each standard account supports one connected Shopify store (`shop_id`). Multi-store agency plans are governed by separate addenda.
            </p>
          </section>

          <section id="plans-quotas">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              3. Subscription Plans, Quotas &amp; USD Billing
            </h2>
            <p style={{ marginBottom: '14px' }}>
              AskAisle offers a 14-day free trial (capped at 100 AI responses) followed by three flat monthly subscription tiers billed in United States Dollars (USD) via our Merchant of Record payment partner (Lemon Squeezy / Paddle / Stripe):
            </p>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Plan Tier</th>
                    <th style={{ padding: '10px 14px' }}>Monthly Price</th>
                    <th style={{ padding: '10px 14px' }}>Included AI Responses</th>
                    <th style={{ padding: '10px 14px' }}>Indexed Documents</th>
                    <th style={{ padding: '10px 14px' }}>Overage Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Starter</td>
                    <td style={{ padding: '10px 14px' }}>$19 / month</td>
                    <td style={{ padding: '10px 14px' }}>500 / month</td>
                    <td style={{ padding: '10px 14px' }}>Up to 100 docs</td>
                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>$0 (Neutral pause at 100%)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Growth</td>
                    <td style={{ padding: '10px 14px' }}>$39 / month</td>
                    <td style={{ padding: '10px 14px' }}>2,000 / month</td>
                    <td style={{ padding: '10px 14px' }}>Up to 1,000 docs</td>
                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>$0 (Neutral pause at 100%)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Pro</td>
                    <td style={{ padding: '10px 14px' }}>$79 / month</td>
                    <td style={{ padding: '10px 14px' }}>6,000 / month</td>
                    <td style={{ padding: '10px 14px' }}>Up to 5,000 docs</td>
                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>$0 (Neutral pause at 100%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: '12px', fontSize: '13.5px', color: '#475569' }}>
              Merchants receive automated email notifications at <strong>80%</strong> and <strong>100%</strong> of their monthly message allowance.
            </p>
          </section>

          <section id="cancellation">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              4. Two-Click Cancellation &amp; Billing Continuity
            </h2>
            <p>
              You may cancel your subscription at any time in two clicks from the <em>Usage &amp; Subscription</em> tab of your Merchant Console. Upon cancellation, no further recurring charges will be made, and your store will retain full access to its paid plan features until the end of the current billing period.
            </p>
          </section>

          <section id="ai-accuracy">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              5. AI Responses, Source Citations &amp; Merchant Responsibility
            </h2>
            <p>
              AskAisle enforces strict vector similarity thresholds and system prompts instructing the model never to promise prices, stock availability, delivery dates, or refunds beyond what is explicitly stated in your indexed store documents. However, the Merchant remains responsible for keeping their Shopify product descriptions, store policies, and Learning Loop FAQ answers accurate and up to date.
            </p>
          </section>

          <section id="acceptable-use">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              6. Acceptable Use &amp; Security Controls
            </h2>
            <p>
              Merchants and visitors may not use AskAisle to promote illegal goods, bypass widget domain restrictions (`allowed_domains`), or conduct automated load testing against `/api/chat`. AskAisle reserves the right to rate-limit or suspend widget keys exhibiting malicious traffic patterns.
            </p>
          </section>

          <section id="ip-ownership">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              7. Intellectual Property &amp; Data Ownership
            </h2>
            <p>
              You retain 100% ownership of all Shopify catalog content, uploaded PDFs, custom FAQs, and captured customer leads. AskAisle retains ownership of its platform code, Shadow DOM widget script, design system, and RAG indexing pipeline.
            </p>
          </section>

          <section id="liability">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '10px' }}>
              8. Service Availability (99.0% Target) &amp; Limitation of Liability
            </h2>
            <p>
              AskAisle targets 99.0% monthly uptime. If an upstream AI provider is temporarily unreachable, the storefront widget automatically degrades gracefully to a polite email capture form so no customer lead is lost. To the maximum extent permitted by law, AskAisle&apos;s aggregate liability shall not exceed the subscription fees paid by the Merchant in the three (3) months preceding the claim.
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
            <Link href="/privacy">Privacy Policy (GDPR)</Link>
            <Link href="/terms" style={{ color: '#60A5FA', fontWeight: 600 }}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
