import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, CheckCircle2, Share2, Copy, Github, ArrowLeft, ExternalLink } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const App = () => {
  const [step, setStep] = useState('input'); // input, loading, results
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Analyzing imagination...');
  const [shortCode, setShortCode] = useState('');
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const statuses = [
    "Analyzing imagination...",
    "Building visual concepts...",
    "Injecting creative parameters...",
    "Rendering creative worlds...",
    "Polishing deep textures...",
    "Finalizing visual masterpiece..."
  ];

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([a-zA-Z0-9]{6})/);
    if (match) {
      fetchShared(match[1]);
    }
  }, []);

  const fetchShared = async (code) => {
    try {
      setStep('loading');
      setLoadingStatus('Materializing shared vision...');
      const response = await axios.get(`/api/share/${code}`);
      setPrompt(response.data.prompt);
      setImages(response.data.images);
      setSelectedImage(response.data.selected_image);
      setShortCode(code);
      setStep('results');
    } catch (err) {
      setError('Shared creation not found in the matrix.');
      setStep('input');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError('');
    setStep('loading');
    setShortCode('');
    setSelectedImage(null);
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      setLoadingStatus(statuses[statusIndex]);
    }, 1800);

    try {
      const response = await axios.post('/api/generate', { prompt });
      setImages(response.data.images);
      
      setTimeout(() => {
        clearInterval(statusInterval);
        setStep('results');
      }, 5000);
    } catch (err) {
      clearInterval(statusInterval);
      setError(err.response?.data?.error || 'Neural network disconnected. Please try again.');
      setStep('input');
    }
  };

  const handleSelect = (img) => {
    if (selectedImage === img) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage(img);
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#b026ff', '#003cff'],
      disableForReducedMotion: true
    });
  };

  const handleShareClick = async () => {
    if (!selectedImage) return;
    if (!shortCode) {
      try {
        const response = await axios.post('/api/save', { prompt, images, selectedImage });
        setShortCode(response.data.shortCode);
      } catch (err) {
        console.error('Failed to save to matrix', err);
        return;
      }
    }
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Floating particles background for input page
  const renderParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, Math.random() * 0.5 + 0.2, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 flex flex-col">
      <div className="ambient-bg" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center mb-12 relative z-10">
        <motion.div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {setStep('input'); setPrompt('');}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <Sparkles className="text-cyan-400 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            Imagine<span className="text-cyan-400">X</span>
          </h1>
        </motion.div>
        <div className="flex gap-4">
          <motion.a whileHover={{ scale: 1.1, rotate: 5 }} href="#" className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-white/30 transition-colors">
            <Github className="w-5 h-5 text-gray-300" />
          </motion.a>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* INPUT PAGE */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              {renderParticles()}
              <motion.h2 
                className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight max-w-4xl gradient-text neon-text"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Turn your imagination<br />into reality.
              </motion.h2>
              <motion.p 
                className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl font-light"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Pure text-to-image generation powered by open-source neural networks. 
                No strings attached, just pure unadulterated creativity.
              </motion.p>

              <motion.div 
                className="w-full max-w-3xl relative z-20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="glass-input-wrapper flex items-center p-2">
                  <input
                    type="text"
                    placeholder="A cybernetic samurai meditating in a neon forest..."
                    className="glass-input flex-1"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    autoFocus
                  />
                  <button onClick={handleGenerate} className="btn-glow flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Generate
                  </button>
                </div>
              </motion.div>
              
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mt-6 text-sm font-medium bg-red-500/10 py-2 px-4 rounded-full border border-red-500/20">
                  {error}
                </motion.p>
              )}
              
              <motion.div 
                className="mt-16 flex flex-wrap justify-center gap-6 md:gap-10 text-gray-400 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Free Forever</span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Open Source</span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5"><CheckCircle2 className="w-4 h-4 text-blue-400" /> No Scraping</span>
              </motion.div>
            </motion.div>
          )}

          {/* LOADING PAGE */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="loading-core mb-12">
                <div className="loading-ring" />
                <div className="loading-ring-inner" />
                <div className="loading-center" />
              </div>
              
              <motion.h3
                key={loadingStatus}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-medium text-white tracking-wide"
              >
                {loadingStatus}
              </motion.h3>
              
              <div className="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          {/* RESULTS PAGE */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
              className="w-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <button 
                    onClick={() => setStep('input')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/30"
                  >
                    <ArrowLeft className="w-4 h-4" /> Initialize new prompt
                  </button>
                  <div className="glass-panel px-6 py-3 border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.1)] inline-block">
                    <p className="text-xs text-cyan-400 mb-1 uppercase tracking-wider font-semibold">Prompt Input</p>
                    <p className="text-white font-medium text-lg">"{prompt}"</p>
                  </div>
                </div>
                
                <AnimatePresence>
                  {selectedImage && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      onClick={handleShareClick}
                      className="btn-glow flex items-center gap-2 relative shadow-[0_0_30px_rgba(176,38,255,0.4)]"
                      style={{ position: 'relative', top: 'auto', right: 'auto', bottom: 'auto' }}
                    >
                      <Share2 className="w-5 h-5" /> Export & Share
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-center">
                {images[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className={`gallery-item max-w-2xl w-full ${selectedImage === images[0] ? 'selected' : ''}`}
                    onClick={() => handleSelect(images[0])}
                  >
                    <div className="gallery-img-wrapper">
                      <img src={images[0]} alt="Generated result" className="gallery-img" />
                      <div className="selection-ring" />
                    </div>
                    <AnimatePresence>
                      {selectedImage === images[0] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.5)] z-20"
                        >
                          <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-8 rounded-3xl share-modal flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Transmission Ready</h3>
              <p className="text-gray-400 mb-8">Your creation has been saved to the matrix. Share this permanent link.</p>
              
              <div className="w-full bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
                <span className="text-cyan-300 font-mono text-lg truncate">imaginex.com/s/{shortCode || '...'}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
                </button>
              </div>
              
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-4 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Close Connection
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-8 text-center text-gray-500 text-sm font-medium relative z-10 flex justify-center items-center gap-2 opacity-60">
        <Sparkles className="w-4 h-4" /> ImagineX Studio © 2026
      </footer>
    </div>
  );
};

export default App;
