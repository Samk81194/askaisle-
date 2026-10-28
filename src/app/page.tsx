'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Layers,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Store,
  FileText,
  Globe,
  Copy,
  CheckCircle2,
  X,
  Truck,
  Shirt,
  RotateCcw,
  Languages,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { supabaseBrowserClient } from '@/lib/supabase/client';

interface DemoMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; url: string }>;
  answered?: boolean;
  latency?: string;
}

export default function LandingPage() {
  const [storeDomain, setStoreDomain] = useState('');
  const [demoStoreUrl, setDemoStoreUrl] = useState('horizon-outfitters.myshopify.com');
  const [isScanningDemoStore, setIsScanningDemoStore] = useState(false);
  const [demoQuery, setDemoQuery] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Interactive ROI Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState(450);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Free SEO Tool State
  const [seoBrandName, setSeoBrandName] = useState('Aurora Skincare');
  const [seoReturnDays, setSeoReturnDays] = useState('30');
  const [seoShipWindow, setSeoShipWindow] = useState('3–5 business days');
  const [copiedFaq, setCopiedFaq] = useState(false);

  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I am the AI assistant for Horizon Outfitters. Ask me about sizing, live stock, shipping windows, or returns — I only answer from verified store pages.',
      answered: true,
    },
  ]);
  const [isDemoThinking, setIsDemoThinking] = useState(false);

  const handleSimulateQuestion = (question: string) => {
    setLeadCaptured(false);
    setDemoMessages((prev) => [...prev, { role: 'user', text: question }]);
    setIsDemoThinking(true);

    setTimeout(() => {
      const q = question.toLowerCase();
      let response = '';
      let sources: Array<{ title: string; url: string }> = [];
      let answered = true;
      let latency = '0.8s';

      if (q.includes('return') || q.includes('refund') || q.includes('retour')) {
        response =
          'We offer a 30-day return policy for unworn items in original packaging with tags attached. Return shipping is free on all US & Canadian orders.';
        sources = [{ title: 'Return & Refund Policy', url: '/policies/refund-policy' }];
      } else if (q.includes('ship') || q.includes('delivery') || q.includes('canada') || q.includes('livraison')) {
        response =
          'Yes! Standard shipping takes 3–5 business days across the US and Canada ($6 flat rate, or free on orders over $75). Express 2-day shipping is available at checkout.';
        sources = [{ title: 'Shipping Policy', url: '/policies/shipping-policy' }];
      } else if (q.includes('size') || q.includes('linen') || q.includes('stock') || q.includes('taille')) {
        response =
          'The Linen Summer Shirt in Navy ($49.00) has a relaxed tailored fit. Sizes S (14 left), M (8 left), and L (3 left) are currently in stock. Size XL is sold out.';
        sources = [{ title: 'Product: Linen Summer Shirt — Navy', url: '/products/linen-summer-shirt' }];
      } else if (q.includes('espagnol') || q.includes('envío') || q.includes('hola')) {
        response =
          '¡Hola! Realizamos envíos a EE. UU. y Canadá en un plazo de 3 a 5 días hábiles. El envío es gratuito para pedidos superiores a $75 USD.';
        sources = [{ title: 'Shipping Policy (Auto-Translated)', url: '/policies/shipping-policy' }];
      } else {
        response =
          "I don't have verified information about that in our catalog or policies. Leave your email below and our team will reply directly — plus your question will be added to our store FAQ!";
        sources = [];
        answered = false;
        latency = '0.2s';
      }

      setDemoMessages((prev) => [
        ...prev,
        { role: 'assistant', text: response, sources, answered, latency },
      ]);
      setIsDemoThinking(false);
    }, 520);
  };

  const handleCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoQuery.trim()) return;
    const q = demoQuery;
    setDemoQuery('');
    handleSimulateQuestion(q);
  };

  const handleScanPublicStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoStoreUrl.trim()) return;
    setIsScanningDemoStore(true);
    setTimeout(() => {
      setIsScanningDemoStore(false);
      const cleanName = demoStoreUrl.replace(/^https?:\/\//, '').split('.')[0] || 'Your Store';
      setDemoMessages([
        {
          role: 'assistant',
          text: `Public catalog indexed for ${cleanName}! Ask me anything about our products, shipping policies, or returns.`,
          answered: true,
        },
      ]);
    }, 850);
  };

  const handleShopifyConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeDomain) {
      setAuthModalOpen(true);
      return;
    }
    const cleanShop = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopUrl = cleanShop.includes('.myshopify.com') ? cleanShop : `${cleanShop}.myshopify.com`;
    window.location.href = `/api/shops/connect?shop=${encodeURIComponent(shopUrl)}`;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      if (authMode === 'signup') {
        const { error } = await supabaseBrowserClient.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setAuthMessage({
          type: 'success',
          text: 'Account created! Check your inbox for the verification link, or proceed to Dashboard.',
        });
      } else if (authMode === 'signin') {
        const { error } = await supabaseBrowserClient.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        window.location.href = '/dashboard';
      } else if (authMode === 'reset') {
        const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/dashboard`,
        });
        if (error) throw error;
        setAuthMessage({
          type: 'success',
          text: 'Password reset link sent (valid for 1 hour). Check your email.',
        });
      }
    } catch (err: unknown) {
      setAuthMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to authenticate. Please verify your connection.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    await supabaseBrowserClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const generatedFaqText = `Q: What is ${seoBrandName}'s return policy?\nA: We offer a ${seoReturnDays}-day hassle-free return policy on all unused items in original packaging.\n\nQ: How fast does ${seoBrandName} ship orders?\nA: Standard orders are processed within 24 hours and delivered in ${seoShipWindow} with tracking.`;

  const copyGeneratedFaq = () => {
    navigator.clipboard.writeText(generatedFaqText);
    setCopiedFaq(true);
    setTimeout(() => setCopiedFaq(false), 2000);
  };

  // ROI Calculations
  const estimatedTickets = Math.round(monthlyOrders * 0.35);
  const autoResolvedTickets = Math.round(estimatedTickets * 0.91);
  const hoursSaved = Math.max(2, Math.round((autoResolvedTickets * 4) / 60));

  const faqs = [
    {
      q: 'How does 1-click Shopify installation work without coding?',
      a: 'When you enter your .myshopify.com domain, AskAisle connects via official read-only Shopify OAuth. It immediately imports your products, variants, pages, and store policies, and gives you a 1-line script (or theme app block) that loads asynchronously in an isolated Shadow DOM.',
    },
    {
      q: 'How do you guarantee the AI will never invent discounts or policies?',
      a: 'Every shopper question is first matched against your verified store chunks using vector cosine similarity. If no snippet from your store reaches the strict confidence threshold, AskAisle does not call the AI model at all—it politely states it does not have that information and captures the shopper’s email for your team.',
    },
    {
      q: 'Will the chat widget slow down my Shopify storefront or break my theme?',
      a: 'Never. The widget script weighs under 15 KB, loads with defer after your page renders, and runs inside a browser Shadow DOM so your Dawn or custom theme CSS remains 100% untouched.',
    },
    {
      q: 'What happens if I reach 100% of my monthly message quota?',
      a: 'Unlike apps that charge surprise $0.03 per-reply overages, AskAisle never bills you extra without permission. You receive email alerts at 80% and 100% usage. At 100%, the widget switches to a clean contact fallback until your next cycle or plan upgrade.',
    },
    {
      q: 'Does AskAisle reply in my customers’ native language?',
      a: 'Yes. AskAisle automatically detects whether your shopper writes in English, French, Spanish, German, or 90+ other languages and replies naturally in their language using your store catalog.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Announcement Bar */}
      <div
        style={{
          background: '#09090B',
          color: '#F8FAFC',
          fontSize: '12px',
          padding: '9px 16px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          borderBottom: '1px solid #27272A',
        }}
      >
        <span
          style={{
            background: '#059669',
            color: '#fff',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '10px',
            letterSpacing: '0.04em',
          }}
        >
          SHOPIFY AI SUPPORT
        </span>
        <span style={{ color: '#E2E8F0' }}>
          Zero-Hallucination Catalog Sync &amp; Self-Learning FAQ Loop for Shopify brands.
        </span>
        <a
          href="#demo-playground"
          style={{ color: '#60A5FA', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          Try Live Simulator <ArrowRight size={12} />
        </a>
      </div>

      {/* 1. Sticky Editorial Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(248, 250, 252, 0.88)',
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
                for Shopify
              </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <a href="#demo-playground" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Live Demo
              </a>
              <a href="#how-it-works" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                How It Works
              </a>
              <a href="#comparison" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Why AskAisle
              </a>
              <a href="#pricing" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Pricing
              </a>
              <a href="#faq" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                FAQ
              </a>
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

      {/* 2. Hero Section + Interactive Storefront Split Preview */}
      <section className="bg-grid-pattern" style={{ padding: '64px 24px 72px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }} className="hero-split-grid">
          {/* Left Column: Value Proposition & 1-Click OAuth */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className="pill-badge pill-emerald">
                <Store size={13} /> Official Shopify OAuth Integration
              </span>
              <span className="pill-badge pill-neutral">Live in under 10 minutes</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 4.4vw, 54px)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                color: '#09090B',
                marginBottom: '20px',
              }}
            >
              The 24/7 AI support agent that{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                already knows
              </span>{' '}
              your Shopify store.
            </h1>

            <p
              style={{
                fontSize: '17px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '540px',
              }}
            >
              Eliminate repetitive customer tickets about sizing, stock, shipping times, and returns. AskAisle synchronizes your catalog and policies in 1 click, cites verified store links, and never invents an answer.
            </p>

            {/* 1-Click Shopify Connect Box */}
            <form
              onSubmit={handleShopifyConnect}
              style={{
                background: '#FFFFFF',
                padding: '8px',
                borderRadius: '14px',
                border: '1px solid #CBD5E1',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                gap: '8px',
                maxWidth: '520px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, paddingLeft: '12px' }}>
                <Store size={18} color="#64748B" />
                <input
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  aria-label="Your Shopify store domain"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#0F172A',
                    background: 'transparent',
                  }}
                />
              </div>
              <button type="submit" className="btn-brand" style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                Start Free Trial <ArrowRight size={15} />
              </button>
            </form>

            {/* Trust Micro-Checklist */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#059669" /> 14-day free trial · No credit card
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#059669" /> Read-only catalog &amp; policy permissions
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#059669" /> Flat monthly pricing ($0 overages)
              </span>
            </div>

            {/* Key Performance Metrics Strip */}
            <div
              style={{
                marginTop: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                maxWidth: '520px',
              }}
            >
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B' }}>91.4%</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Tickets auto-resolved</div>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>1.8 sec</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Avg streaming reply</div>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB' }}>0%</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Invented discounts</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Storefront + Floating Widget Simulator */}
          <div id="demo-playground" className="surface-card" style={{ boxShadow: 'var(--shadow-xl)', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
            {/* Browser Chrome Header with Live Store URL Tester */}
            <div
              style={{
                background: '#F1F5F9',
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FDA4AF' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FCD34D' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6EE7B7' }} />
              </div>

              <form
                onSubmit={handleScanPublicStore}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '4px 6px 4px 10px',
                  gap: '6px',
                }}
              >
                <Globe size={13} color="#64748B" />
                <input
                  type="text"
                  value={demoStoreUrl}
                  onChange={(e) => setDemoStoreUrl(e.target.value)}
                  placeholder="Paste any Shopify URL to preview..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: '#0F172A',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#09090B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isScanningDemoStore ? 'Syncing...' : 'Load Store'}
                </button>
              </form>

              <span className="pill-badge pill-blue" style={{ padding: '2px 8px', fontSize: '11px' }}>
                Live Preview
              </span>
            </div>

            {/* Split Store Context + Chat Stream */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '470px', background: '#FFFFFF' }}>
              {/* Left Sidebar inside Mockup: Prompt Presets with SVG Icons */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRight: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '10px' }}>
                    Try Sample Shopper Questions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { icon: Truck, label: 'US & Canada delivery', q: 'Do you ship to Canada and how long does it take?' },
                      { icon: Shirt, label: 'Linen Shirt size M stock', q: 'Is the Linen Summer Shirt in Navy available in size M?' },
                      { icon: RotateCcw, label: '30-day return policy', q: 'What is your return & refund policy?' },
                      { icon: Languages, label: 'Multilingual (Spanish)', q: 'Hola, ¿cuánto tarda el envío?' },
                      { icon: AlertTriangle, label: 'Missing info / Lead capture', q: 'Do you offer custom monogram embroidery?' },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSimulateQuestion(item.q)}
                          style={{
                            textAlign: 'left',
                            background: '#FFFFFF',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#1E293B',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icon size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={13} color="#059669" /> Verified Store Context
                  </div>
                  <div style={{ color: '#64748B', lineHeight: 1.4 }}>
                    Every answer cites the exact Shopify product or policy page.
                  </div>
                </div>
              </div>

              {/* Right Column inside Mockup: Live Widget Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '470px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#09090B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      AI
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>Horizon Store Assistant</div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        AI Support · Verified Catalog
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#A1A1AA', fontFamily: 'var(--font-mono)' }}>24/7 Active</span>
                </div>

                {/* Messages Scroll Area */}
                <div
                  style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    background: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {demoMessages.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        padding: '11px 14px',
                        borderRadius: '14px',
                        borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
                        borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '14px',
                        background: m.role === 'user' ? '#09090B' : '#FFFFFF',
                        color: m.role === 'user' ? '#FFFFFF' : '#0F172A',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                        boxShadow: m.role === 'assistant' ? 'var(--shadow-xs)' : 'none',
                      }}
                    >
                      <div>{m.text}</div>

                      {m.sources && m.sources.length > 0 && (
                        <div
                          style={{
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px dashed #E2E8F0',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#2563EB',
                              background: '#EFF6FF',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            <FileText size={11} /> Verified Source: {m.sources[0].title}
                          </span>
                          {m.latency && (
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                              Replied in {m.latency}
                            </span>
                          )}
                        </div>
                      )}

                      {m.role === 'assistant' && m.answered === false && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {!leadCaptured ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="email"
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                placeholder="Enter your email for a direct reply..."
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setLeadCaptured(true)}
                                style={{
                                  background: '#2563EB',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Notify Me
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                              ✓ Saved! Forwarded to merchant&apos;s Learning Loop inbox.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isDemoThinking && (
                    <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', paddingLeft: '4px' }}>
                      Checking verified store catalog...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleCustomQuestion}
                  style={{
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ask any question about products or policies..."
                    maxLength={500}
                    value={demoQuery}
                    onChange={(e) => setDemoQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button type="submit" className="btn-obsidian" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works in 3 Steps + Bento Grid Architecture */}
      <section id="how-it-works" style={{ padding: '84px 24px', maxWidth: '1220px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 52px' }}>
          <span className="pill-badge pill-blue" style={{ marginBottom: '12px' }}>
            Built Exclusively for Shopify Merchants
          </span>
          <h2 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B', marginBottom: '12px' }}>
            From installation to automated replies in under 10 minutes
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            No complex flowcharts or manual training trees. AskAisle reads your existing Shopify data and keeps itself updated automatically.
          </p>
        </div>

        {/* 3-Step Horizontal Architecture Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            {
              step: '01',
              title: 'Connect Shopify via 1-Click OAuth',
              desc: 'Authorize read-only access to your products, variants, pages, and store policies. Zero customer payment data is ever touched.',
            },
            {
              step: '02',
              title: 'Automatic Catalog & Policy Indexing',
              desc: 'Up to 500 products and policies are cleaned, chunked, and indexed in under 5 minutes. You can also upload custom PDFs or FAQ URLs.',
            },
            {
              step: '03',
              title: 'Go Live & Grow Your Knowledge Base',
              desc: 'Embed the isolated Shadow DOM widget on your theme. Any question missing from your docs is captured so you can answer once and train the bot forever.',
            },
          ].map((s, i) => (
            <div key={i} className="surface-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  STEP {s.step}
                </span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090B', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="bento-grid-layout">
          {/* Bento Card 1: The Unanswered Questions Learning Loop */}
          <div className="bento-card" style={{ gridColumn: 'span 7', padding: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="pill-badge pill-amber">Self-Improving Knowledge Loop</span>
                <Sparkles size={18} color="#D97706" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#09090B', marginBottom: '8px' }}>
                Every unanswered question upgrades your store&apos;s brain
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                When a shopper asks something not yet covered on your product pages, AskAisle politely captures their email, alerts you, and lets you publish the official answer to your knowledge base in 1 click.
              </p>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  Captured Shopper Inquiry · <span style={{ color: '#2563EB' }}>claire.m@gmail.com</span>
                </span>
                <span className="pill-badge pill-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  + Instant QA Indexing
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                &ldquo;Is the Merino Wool Sweater machine-washable on a cold wool cycle?&rdquo;
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Your 1-line reply trains the assistant permanently &amp; emails the shopper back.
              </div>
            </div>
          </div>

          {/* Bento Card 2: 1-Click Shopify Catalog & Policy Sync */}
          <div className="bento-card" style={{ gridColumn: 'span 5', padding: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="pill-badge pill-blue">Real-Time Store Sync</span>
                <Zap size={18} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#09090B', marginBottom: '8px' }}>
                Products, stock, pages &amp; PDFs always up to date
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Automatic daily synchronization plus manual URL, text, and PDF uploads (up to 10 MB). Smart content hashing ensures unchanged pages are never re-indexed.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { type: 'Shopify Products & Live Variants', count: '248 synced' },
                { type: 'Refund, Shipping & Privacy Policies', count: '4 synced' },
                { type: 'Apparel Size & Fit Chart (PDF)', count: '14 sections' },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{row.type}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                    ● {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Competitor Comparison & Interactive ROI Calculator */}
      <section
        id="comparison"
        style={{
          padding: '80px 24px',
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '40px', alignItems: 'center' }}>
          {/* Comparison Table (Section 3 & 12 of PRD) */}
          <div>
            <span className="pill-badge pill-emerald" style={{ marginBottom: '12px' }}>
              Purpose-Built vs. Generalist Tools
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B', marginBottom: '16px' }}>
              Why Shopify merchants choose AskAisle over generic chatbots
            </h2>

            <div className="surface-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px', color: '#475569' }}>Capability</th>
                    <th style={{ padding: '14px 16px', color: '#09090B', fontWeight: 800 }}>AskAisle</th>
                    <th style={{ padding: '14px 16px', color: '#64748B' }}>Chatbase / SiteGPT</th>
                    <th style={{ padding: '14px 16px', color: '#64748B' }}>Per-Reply Bots</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feat: '1-Click Shopify Catalog & Variant Sync', ask: 'Included', gen: 'Manual scraping', per: 'Included' },
                    { feat: 'Predictable Monthly Pricing ($0 Overages)', ask: 'Flat Plan', gen: 'Tiered addons', per: '$0.03 / extra reply' },
                    { feat: 'Unanswered Question -> 1-Click FAQ Loop', ask: 'Built-in', gen: 'Manual export', per: 'Limited' },
                    { feat: 'Zero-Hallucination Similarity Cutoff', ask: 'Strict Guardrail', gen: 'Prompt-only', per: 'Variable' },
                    { feat: 'Shadow DOM Theme Isolation (< 15 KB)', ask: '100% Isolated', gen: 'Iframe embed', per: 'Theme script' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{r.feat}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>✓ {r.ask}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{r.gen}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{r.per}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Merchant Time & ROI Calculator */}
          <div className="surface-card" style={{ padding: '32px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="pill-badge pill-blue">Support Savings Calculator</span>
              <Clock size={18} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginBottom: '8px' }}>
              See how much time AskAisle saves your store each month
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Slide to match your monthly Shopify order volume:
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>
                <span>Monthly Store Orders</span>
                <span style={{ color: '#2563EB', fontFamily: 'var(--font-mono)' }}>{monthlyOrders} orders / mo</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>50 orders</span>
                <span>1,000 orders</span>
                <span>2,000 orders</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090B' }}>{autoResolvedTickets}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Repetitive tickets deflected / mo</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>{hoursSaved} hrs</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Founder support time saved / mo</div>
              </div>
            </div>

            <Link href="/dashboard" className="btn-obsidian" style={{ width: '100%' }}>
              Automate {autoResolvedTickets} Monthly Tickets Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Free SEO Acquisition Tool: Instant Shopify FAQ Builder */}
      <section
        id="free-seo-tool"
        style={{
          padding: '72px 24px',
          maxWidth: '1160px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="surface-card" style={{ padding: '40px', background: '#FFFFFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <span className="pill-badge pill-emerald" style={{ marginBottom: '12px' }}>
                Free Merchant Utility · Shopify Policy Generator
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B', marginBottom: '12px' }}>
                Generate your Shopify Shipping &amp; Return Policy FAQ in 10 seconds
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Need clean policy text for your store? Customize the fields below to generate ready-to-paste FAQ copy — or import it straight into AskAisle.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Store / Brand Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={seoBrandName}
                    onChange={(e) => setSeoBrandName(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Return Window (Days)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={seoReturnDays}
                      onChange={(e) => setSeoReturnDays(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Standard Delivery Time
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={seoShipWindow}
                      onChange={(e) => setSeoShipWindow(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  Structured Store FAQ Snippet
                </span>
                <button onClick={copyGeneratedFaq} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  {copiedFaq ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  {copiedFaq ? 'Copied!' : 'Copy Snippet'}
                </button>
              </div>
              <pre
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: '#1E293B',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}
              >
                {generatedFaqText}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Want this answered 24/7 on your storefront?
                </span>
                <Link href="/dashboard" style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Sync with AskAisle <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" style={{ padding: '64px 24px 88px', maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px' }}>
          <span className="pill-badge pill-neutral" style={{ marginBottom: '12px' }}>
            Simple, Predictable Monthly Plans
          </span>
          <h2 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B', marginBottom: '12px' }}>
            Flat monthly pricing. Zero surprise overage charges.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            Start with a 14-day free trial (100 AI replies included, no credit card required). Cancel anytime in 2 clicks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px' }}>
          {/* Starter Plan */}
          <div className="surface-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#09090B' }}>Starter</h3>
                <span className="pill-badge pill-neutral" style={{ fontSize: '11px' }}>Solo Merchants</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Ideal for new Shopify stores automating customer support for the first time.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B' }}>$19</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ month (USD)</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> <strong>500 AI responses</strong> / month</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> Up to <strong>100 indexed documents</strong></li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> 1-Click Shopify product &amp; policy sync</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> Unanswered questions Learning Loop</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#64748B" /> Includes &ldquo;Powered by AskAisle&rdquo; badge</li>
              </ul>
            </div>

            <Link href="/dashboard?plan=starter" className="btn-outline" style={{ width: '100%', padding: '12px' }}>
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Growth Plan (Highlighted) */}
          <div
            className="surface-card"
            style={{
              padding: '32px',
              border: '2px solid #09090B',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-13px',
                right: '24px',
                background: '#09090B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '999px',
                letterSpacing: '0.03em',
              }}
            >
              MOST POPULAR
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#09090B' }}>Growth</h3>
                <span className="pill-badge pill-blue" style={{ fontSize: '11px' }}>Scaling Brands</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                For stores processing 250 to 2,000 orders/month needing white-label branding.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B' }}>$39</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ month (USD)</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#2563EB" /> <strong>2,000 AI responses</strong> / month</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#2563EB" /> Up to <strong>1,000 indexed documents</strong></li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#2563EB" /> <strong>White-label widget</strong> (No badge)</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#2563EB" /> Instant email notifications for captured leads</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#2563EB" /> Automatic daily catalog re-sync</li>
              </ul>
            </div>

            <Link href="/dashboard?plan=growth" className="btn-obsidian" style={{ width: '100%', padding: '12px' }}>
              Start 14-Day Free Trial <ArrowRight size={15} />
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="surface-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#09090B' }}>Pro</h3>
                <span className="pill-badge pill-emerald" style={{ fontSize: '11px' }}>High Volume</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                For large catalogs and high-traffic Shopify stores needing full data export.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#09090B' }}>$79</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ month (USD)</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> <strong>6,000 AI responses</strong> / month</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> Up to <strong>5,000 indexed documents</strong></li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> CSV &amp; JSON conversation history export</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> Custom URL, text &amp; PDF knowledge base</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={16} color="#059669" /> Priority customer support</li>
              </ul>
            </div>

            <Link href="/dashboard?plan=pro" className="btn-outline" style={{ width: '100%', padding: '12px' }}>
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions Accordion */}
      <section
        id="faq"
        style={{
          padding: '72px 24px 96px',
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="pill-badge pill-neutral" style={{ marginBottom: '10px' }}>
              Merchant FAQ
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#09090B', letterSpacing: '-0.03em' }}>
              Everything you need to know before installing
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="surface-card"
                  style={{ overflow: 'hidden', background: isOpen ? '#F8FAFC' : '#FFFFFF' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#09090B',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      color="#64748B"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 22px 18px', fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
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
            <Link href="/login">Merchant Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <a href="#free-seo-tool">Free FAQ Builder</a>
            <Link href="/privacy">Privacy Policy (GDPR)</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(9, 9, 11, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div className="surface-card" style={{ width: '100%', maxWidth: '420px', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '16px' }}>AskAisle</span>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
              {authMode === 'signup' && 'Create your merchant account'}
              {authMode === 'signin' && 'Welcome back'}
              {authMode === 'reset' && 'Reset your password'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {authMode === 'signup' && 'Start your 14-day free trial in under 60 seconds.'}
              {authMode === 'signin' && 'Sign in to manage your Shopify chatbot and conversations.'}
              {authMode === 'reset' && 'Receive a secure password reset link valid for 1 hour.'}
            </p>

            {authMode !== 'reset' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleOAuth}
                  className="btn-outline"
                  style={{ width: '100%', marginBottom: '16px', justifyContent: 'center' }}
                >
                  <Globe size={15} /> Continue with Google
                </button>
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  or with email
                </div>
              </>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Work Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="founder@yourstore.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              {authMode !== 'reset' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Password</label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('reset')}
                        style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2563EB', cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>
              )}

              {authMessage && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: authMessage.type === 'success' ? '#ECFDF5' : '#FFF1F2',
                    color: authMessage.type === 'success' ? '#059669' : '#E11D48',
                    border: `1px solid ${authMessage.type === 'success' ? '#A7F3D0' : '#FECDD3'}`,
                  }}
                >
                  {authMessage.text}
                </div>
              )}

              <button type="submit" disabled={authLoading} className="btn-obsidian" style={{ width: '100%', marginTop: '4px' }}>
                {authLoading
                  ? 'Processing...'
                  : authMode === 'signup'
                  ? 'Create Free Account'
                  : authMode === 'signin'
                  ? 'Sign In'
                  : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
