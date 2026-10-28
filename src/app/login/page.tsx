'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Globe, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { supabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabaseBrowserClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { shop_domain: shopDomain },
          },
        });
        if (error) throw error;
        setFeedback({
          type: 'success',
          text: 'Verification email sent! Please check your inbox or continue directly to the Merchant Console.',
        });
      } else if (mode === 'signin') {
        const { error } = await supabaseBrowserClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/dashboard';
      } else {
        const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/dashboard`,
        });
        if (error) throw error;
        setFeedback({
          type: 'success',
          text: 'Password reset link sent to your email (valid for 60 minutes).',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Unable to connect to authentication service.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabaseBrowserClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.05fr' }}>
      {/* Left Column: Auth Form */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#09090B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={18} color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.03em', color: '#09090B' }}>
              AskAisle
            </span>
          </Link>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090B', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {mode === 'signin' && 'Sign in to your store console'}
            {mode === 'signup' && 'Start your 14-day free trial'}
            {mode === 'reset' && 'Reset your password'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px' }}>
            {mode === 'signin' && 'Manage your Shopify AI support assistant and customer conversations.'}
            {mode === 'signup' && 'Connect your Shopify catalog in under 10 minutes. No credit card required.'}
            {mode === 'reset' && 'Enter your account email to receive a 1-hour recovery link.'}
          </p>

          {mode !== 'reset' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-outline"
                style={{ width: '100%', padding: '11px', marginBottom: '18px' }}
              >
                <Globe size={16} /> Continue with Google
              </button>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '18px',
                }}
              >
                or continue with email
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Work Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="founder@yourstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Shopify Store Domain (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="your-store.myshopify.com"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {feedback && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: feedback.type === 'success' ? '#ECFDF5' : '#FFF1F2',
                  color: feedback.type === 'success' ? '#059669' : '#E11D48',
                  border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECDD3'}`,
                }}
              >
                {feedback.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-obsidian" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Free Account'
                : 'Send Recovery Link'}
              <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            {mode === 'signin' ? (
              <>
                New to AskAisle?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}
                >
                  Start 14-day free trial
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', fontSize: '12px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 AskAisle Inc.</span>
          <div style={{ display: 'flex', gap: '14px' }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Column: Editorial Trust Showcase */}
      <div
        className="bg-grid-pattern"
        style={{
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          <span className="pill-badge pill-emerald" style={{ marginBottom: '20px' }}>
            <ShieldCheck size={13} /> Read-Only Shopify Security
          </span>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090B', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '16px' }}>
            &ldquo;AskAisle cut our repetitive sizing and shipping emails by 92% in our very first week.&rdquo;
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '32px' }}>
            — Maya L., Founder of Horizon Outfitters (1,200 monthly Shopify orders)
          </p>

          <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Included in every trial
            </div>
            {[
              '1-Click Shopify product, variant & policy import',
              'Zero-hallucination answers with cited store links',
              'Self-learning FAQ queue for unanswered questions',
              'Isolated Shadow DOM widget (< 15 KB script)',
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

