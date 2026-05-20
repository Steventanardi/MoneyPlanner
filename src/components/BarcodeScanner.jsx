import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ScanLine, AlertTriangle, CheckCircle } from 'lucide-react';

const BarcodeScanner = ({ onResult, onCancel }) => {
  const [phase, setPhase] = useState('scanning'); // scanning | loading | notfound | error
  const [message, setMessage] = useState('');
  const [foundBarcode, setFoundBarcode] = useState('');
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const resolvedRef = useRef(false);

  const lookupBarcode = async (barcode) => {
    setFoundBarcode(barcode);
    setPhase('loading');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const name = p.product_name_en || p.product_name || '';
        const brand = p.brands || '';
        const fullName = name && brand ? `${name} – ${brand}` : name || brand || `Product ${barcode}`;
        onResult({ name: fullName, barcode });
      } else {
        setMessage(`Barcode ${barcode} not in database. You can enter the name manually.`);
        setPhase('notfound');
      }
    } catch {
      setMessage('Network error. Check your connection and try again.');
      setPhase('error');
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    let mounted = true;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
      if (result && !resolvedRef.current && mounted) {
        resolvedRef.current = true;
        controlsRef.current?.stop();
        lookupBarcode(result.getText());
      }
    })
      .then(c => { if (mounted) controlsRef.current = c; })
      .catch(() => {
        if (mounted) {
          setMessage('Camera access denied or unavailable.');
          setPhase('error');
        }
      });

    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, []);

  const handleUseBarcode = () => onResult({ name: '', barcode: foundBarcode });
  const handleRetry = () => {
    resolvedRef.current = false;
    setPhase('scanning');
    setFoundBarcode('');
    setMessage('');
    controlsRef.current?.stop();

    const reader = new BrowserMultiFormatReader();
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (result && !resolvedRef.current) {
        resolvedRef.current = true;
        controlsRef.current?.stop();
        lookupBarcode(result.getText());
      }
    })
      .then(c => { controlsRef.current = c; })
      .catch(() => { setMessage('Camera unavailable.'); setPhase('error'); });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onCancel}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.12)', border: 'none',
          width: '42px', height: '42px', borderRadius: '14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10
        }}
      >
        <X size={20} color="white" />
      </motion.button>

      {/* Title */}
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '700', marginBottom: '20px', letterSpacing: '0.3px' }}>
        {phase === 'scanning' ? 'Point camera at barcode' : phase === 'loading' ? 'Looking up product…' : 'Result'}
      </p>

      {/* Camera viewfinder */}
      <div style={{
        position: 'relative', width: '300px', height: '220px',
        borderRadius: '20px', overflow: 'hidden',
        background: '#000',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.15)',
        flexShrink: 0
      }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: phase === 'scanning' ? 'block' : 'none' }}
          muted
          playsInline
        />

        {/* Scan line animation */}
        {phase === 'scanning' && (
          <>
            {/* Corner brackets */}
            {[
              { top: 10, left: 10, borderTop: '3px solid #007AFF', borderLeft: '3px solid #007AFF' },
              { top: 10, right: 10, borderTop: '3px solid #007AFF', borderRight: '3px solid #007AFF' },
              { bottom: 10, left: 10, borderBottom: '3px solid #007AFF', borderLeft: '3px solid #007AFF' },
              { bottom: 10, right: 10, borderBottom: '3px solid #007AFF', borderRight: '3px solid #007AFF' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '2px', ...s }} />
            ))}
            <motion.div
              animate={{ top: ['15%', '80%', '15%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', left: '10%', right: '10%',
                height: '2px', background: 'rgba(0,122,255,0.8)',
                boxShadow: '0 0 8px rgba(0,122,255,0.6)'
              }}
            />
          </>
        )}

        {/* Loading overlay */}
        {phase === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <Loader2 size={32} color="#007AFF" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Fetching product info…</span>
          </div>
        )}

        {/* Not found / error overlay */}
        {(phase === 'notfound' || phase === 'error') && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            padding: '16px', textAlign: 'center'
          }}>
            <AlertTriangle size={28} color={phase === 'error' ? '#FF3B30' : '#FF9500'} />
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600', lineHeight: 1.5 }}>{message}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        {(phase === 'notfound' || phase === 'error') && (
          <>
            {phase === 'notfound' && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleUseBarcode}
                style={{
                  padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: '#007AFF', color: 'white', fontSize: '15px', fontWeight: '800'
                }}
              >
                Continue — Enter Name Manually
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleRetry}
              style={{
                padding: '15px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', background: 'transparent', color: 'white', fontSize: '15px', fontWeight: '700'
              }}
            >
              Scan Again
            </motion.button>
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCancel}
          style={{
            padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '700'
          }}
        >
          Cancel
        </motion.button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default BarcodeScanner;
