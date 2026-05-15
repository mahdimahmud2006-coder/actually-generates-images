import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, Copy, Check, ArrowLeft, Share } from 'lucide-react';
import axios from 'axios';

// Spring config — Apple-like feel
const spring = { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 };
const springGentle = { type: 'spring', stiffness: 100, damping: 20 };

export default function App() {
  const [step, setStep] = useState('input'); // input | loading | result
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingText, setLoadingText] = useState('Understanding your idea…');
  const [error, setError] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const loadingTexts = [
    'Understanding your idea…',
    'Composing visuals…',
    'Generating image…',
    'Adding final touches…',
    'Almost there…',
  ];

  useEffect(() => {
    if (step === 'input') setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([a-zA-Z0-9]{6})/);
    if (match) fetchShared(match[1]);
  }, []);

  const fetchShared = async (code) => {
    try {
      setStep('loading');
      const res = await axios.get(`/api/share/${code}`);
      setPrompt(res.data.prompt);
      setImageUrl(res.data.selected_image);
      setShortCode(code);
      setStep('result');
    } catch {
      setStep('input');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError('');
    setStep('loading');
    setImageUrl('');
    setShortCode('');

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[i]);
    }, 2000);

    const minTimer = new Promise(res => setTimeout(res, 3500));

    try {
      const [res] = await Promise.all([
        axios.post('/api/generate', { prompt }),
        minTimer
      ]);
      clearInterval(interval);
      setImageUrl(res.data.images[0]);
      setStep('result');
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setStep('input');
    }
  };

  const handleShare = async () => {
    if (shortCode) return;
    try {
      const res = await axios.post('/api/save', {
        prompt,
        images: [imageUrl],
        selectedImage: imageUrl,
      });
      setShortCode(res.data.shortCode);
    } catch { }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep('input');
    setPrompt('');
    setImageUrl('');
    setShortCode('');
    setError('');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background scene */}
      <div className="bg-scene">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-noise" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <button
          onClick={reset}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}
        >
          <div style={{
            width: 36, height: 36,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(20px)',
          }}>
            <Sparkles size={16} style={{ color: 'rgba(180,215,255,0.8)' }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            ImagineX
          </span>
        </button>

        <AnimatePresence>
          {step === 'result' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
              onClick={reset}
              className="btn-apple"
              style={{ fontSize: '0.85rem', padding: '10px 18px' }}
            >
              <ArrowLeft size={14} /> New image
            </motion.button>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px 48px',
        position: 'relative',
        zIndex: 10,
      }}>
        <AnimatePresence mode="wait">

          {/* INPUT */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20, filter: 'blur(8px)' }}
              transition={springGentle}
              style={{ width: '100%', maxWidth: 680, textAlign: 'center' }}
            >
              <motion.p
                className="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{ marginBottom: 24 }}
              >
                AI Image Studio
              </motion.p>

              <motion.h1
                className="title-hero"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.2 }}
                style={{ marginBottom: 18 }}
              >
                Imagine anything.
              </motion.h1>

              <motion.p
                className="subtitle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.3 }}
                style={{ marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}
              >
                Type a description and watch it become a stunning image instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.4 }}
              >
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
                  <button
                    onClick={handleGenerate}
                    className="btn-apple btn-primary"
                    style={{ margin: '6px', flexShrink: 0 }}
                  >
                    Generate
                    <ArrowRight size={15} />
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 16, color: 'rgba(255,100,100,0.7)', fontSize: '0.875rem' }}
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ marginTop: 52, display: 'flex', justifyContent: 'center', gap: 32 }}
              >
                {['Free forever', 'Open source', 'No sign-up'].map(tag => (
                  <span key={tag} style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', letterSpacing: '0.02em' }}>
                    {tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
            >
              <div className="loading-ring-wrap">
                <div className="loading-ring-track" />
                <div className="loading-ring-fill" />
              </div>

              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 400 }}
              >
                {loadingText}
              </motion.p>
            </motion.div>
          )}

          {/* RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={springGentle}
              style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Image */}
              <motion.div
                className="image-card"
                layoutId="main-image"
                style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-img)' }}
              >
                <img src={imageUrl} alt={prompt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'var(--radius-img)' }} />
              </motion.div>

              {/* Prompt label */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '-0.01em', lineHeight: 1.5 }}>
                  "{prompt}"
                </p>
                <button
                  className="btn-apple"
                  style={{ fontSize: '0.8rem', padding: '8px 16px', flexShrink: 0 }}
                  onClick={handleShare}
                >
                  <Share size={13} />
                  Share
                </button>
              </div>

              {/* Share URL card */}
              <AnimatePresence>
                {shortCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={spring}
                    className="url-card"
                  >
                    <div style={{ flex: 1 }}>
                      <p className="label" style={{ marginBottom: 4 }}>Your link is ready</p>
                      <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
                        imaginex.com/s/{shortCode}
                      </p>
                    </div>
                    <button
                      className="btn-apple"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', flexShrink: 0 }}
                      onClick={copyLink}
                    >
                      {copied ? <Check size={14} style={{ color: 'rgba(100,255,150,0.9)' }} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          position: 'relative', zIndex: 10,
          textAlign: 'center',
          padding: '16px 24px 28px',
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
        }}
      >
        ImagineX Studio — Free AI Image Generation
      </motion.footer>
    </div>
  );
}
