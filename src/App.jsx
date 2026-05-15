import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Copy, Check, ArrowLeft, Share } from 'lucide-react';
import axios from 'axios';

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });
}

export default function App() {
  const [step, setStep] = useState('input');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingText, setLoadingText] = useState('Understanding your idea…');
  const [error, setError] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const inputRef = useRef(null);

  const loadingTexts = [
    'Understanding your idea…',
    'Composing visuals…',
    'Generating image…',
    'Adding final touches…',
    'Almost there…',
  ];

  useEffect(() => {
    if (step === 'input') setTimeout(() => inputRef.current?.focus(), 100);
  }, [step]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([a-zA-Z0-9]{6})/);
    if (match) fetchShared(match[1]);
  }, []);

  const go = (nextStep) => {
    setVisible(false);
    setTimeout(() => { setStep(nextStep); setVisible(true); }, 260);
  };

  const fetchShared = async (code) => {
    try {
      go('loading');
      const res = await axios.get(`/api/share/${code}`);
      setPrompt(res.data.prompt);
      setImageUrl(res.data.selected_image);
      setShortCode(code);
      go('result');
    } catch { go('input'); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError('');
    go('loading');
    setImageUrl(''); setShortCode('');

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[i]);
    }, 2000);

    try {
      const [res] = await Promise.all([
        axios.post('/api/generate', { prompt }),
        new Promise(r => setTimeout(r, 1500))
      ]);
      const url = res.data.images[0];
      setLoadingText('Loading image…');
      await preloadImage(url);
      clearInterval(interval);
      setImageUrl(url);
      go('result');
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      go('input');
    }
  };

  const handleShare = async () => {
    if (shortCode) return;
    try {
      const res = await axios.post('/api/save', { prompt, images: [imageUrl], selectedImage: imageUrl });
      setShortCode(res.data.shortCode);
    } catch {}
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    go('input');
    setTimeout(() => { setPrompt(''); setImageUrl(''); setShortCode(''); setError(''); }, 260);
  };

  const fade = {
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(10px)',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-scene">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-noise" />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: 36, height: 36, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
            <Sparkles size={16} style={{ color: 'rgba(180,215,255,0.8)' }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>ImagineX</span>
        </button>
        {step === 'result' && (
          <button className="btn-apple" style={{ fontSize: '0.85rem', padding: '10px 18px' }} onClick={reset}>
            <ArrowLeft size={14} /> New image
          </button>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 48px', position: 'relative', zIndex: 10 }}>
        <div style={fade}>

          {step === 'input' && (
            <div style={{ width: '100%', maxWidth: 660, textAlign: 'center' }}>
              <p className="label" style={{ marginBottom: 24 }}>AI Image Studio</p>
              <h1 className="title-hero" style={{ marginBottom: 18 }}>Imagine anything.</h1>
              <p className="subtitle" style={{ maxWidth: 440, margin: '0 auto 48px' }}>
                Type a description and watch it become a stunning image.
              </p>
              <div className="glass-pill" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  className="prompt-input"
                  type="text"
                  placeholder="A misty mountain lake at golden hour…"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
                <button onClick={handleGenerate} className="btn-apple btn-primary" style={{ margin: 6, flexShrink: 0 }}>
                  Generate <ArrowRight size={15} />
                </button>
              </div>
              {error && <p style={{ marginTop: 16, color: 'rgba(255,100,100,0.7)', fontSize: '0.875rem' }}>{error}</p>}
              <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 32 }}>
                {['Free forever', 'Open source', 'No sign-up'].map(t => (
                  <span key={t} style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              <div className="loading-ring-wrap">
                <div className="loading-ring-track" />
                <div className="loading-ring-fill" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{loadingText}</p>
            </div>
          )}

          {step === 'result' && (
            <div style={{ width: '100%', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderRadius: 'var(--radius-img)', overflow: 'hidden', boxShadow: 'var(--shadow-deep)' }}>
                <img src={imageUrl} alt={prompt} style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>"{prompt}"</p>
                <button className="btn-apple" style={{ fontSize: '0.8rem', padding: '8px 16px', flexShrink: 0 }} onClick={handleShare}>
                  <Share size={13} /> Share
                </button>
              </div>
              {shortCode && (
                <div className="url-card">
                  <div style={{ flex: 1 }}>
                    <p className="label" style={{ marginBottom: 4 }}>Your link is ready</p>
                    <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'monospace' }}>
                      imaginex.com/s/{shortCode}
                    </p>
                  </div>
                  <button className="btn-apple" style={{ padding: '10px 16px', flexShrink: 0 }} onClick={copyLink}>
                    {copied ? <Check size={14} style={{ color: 'rgba(100,255,150,0.9)' }} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '16px 24px 28px', color: 'var(--text-tertiary)', fontSize: '0.75rem', letterSpacing: '0.02em' }}>
        ImagineX Studio — Free AI Image Generation
      </footer>
    </div>
  );
}
