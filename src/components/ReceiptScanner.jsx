import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, RefreshCw, Loader2 } from 'lucide-react';

const ReceiptScanner = ({ onScanComplete, onCancel }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);
    const workerRef = useRef(null);

    // Create Tesseract worker once on mount, terminate on unmount
    useEffect(() => {
        let worker;
        const initWorker = async () => {
            worker = await createWorker('chi_tra+eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setStatusText(`Reading receipt... ${Math.round(m.progress * 100)}%`);
                        setProgress(Math.round(m.progress * 100));
                    } else if (m.status === 'loading tesseract core') {
                        setStatusText('Loading AI core...');
                    } else if (m.status === 'loading language traineddata') {
                        setStatusText('Loading language data...');
                    } else {
                        setStatusText(m.status + '...');
                    }
                }
            });
            workerRef.current = worker;
        };
        initWorker();
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewImage(event.target.result);
            processImage(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (image) => {
        setIsScanning(true);
        setProgress(0);
        setStatusText('Initializing AI engine...');

        try {
            if (!workerRef.current) {
                setStatusText('Worker not ready, please try again.');
                setIsScanning(false);
                return;
            }
            const { data: { text } } = await workerRef.current.recognize(image);

            setStatusText('Decoding details...');
            console.log('Final Extracted Text:', text);
            const extractedData = parseReceiptText(text);
            
            if (!extractedData.amount) {
                setStatusText('Searching harder for amount...');
                // One last try with very loose regex
                const looseNumbers = text.match(/\d{2,}/g);
                if (looseNumbers) {
                    const candidates = looseNumbers.map(n => parseInt(n)).filter(n => n > 0 && n < 10000);
                    if (candidates.length > 0) {
                        extractedData.amount = Math.max(...candidates).toString();
                    }
                }
            }

            if (extractedData.amount) {
                setStatusText(`Found Total: ${extractedData.amount}`);
                setTimeout(() => onScanComplete({ ...extractedData, receiptImage: image }), 1000);
            } else {
                setStatusText('Analyzing complete. Verifying manually.');
                setTimeout(() => onScanComplete({ ...extractedData, receiptImage: image }), 1000);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            setStatusText('Error: Scan failed. Check lighting.');
            setIsScanning(false);
        }
    };

    const parseReceiptText = (text) => {
        const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let amount = '';
        let merchant = '';
        
        // 1. Merchant Extraction (Clean first line)
        if (rawLines.length > 0) {
            merchant = rawLines[0].replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim();
        }

        // 2. AGGRESSIVE Amount Extraction
        const totalKeywords = ['應付', '应付', '合計', '合计', '總計', '总计', '金额', '金額', 'total', 'amount', 'payable', '实付', '实收', 'sum', 'nt$', '$'];
        
        // Strategy A: Proximity Search
        const searchRegion = text.toLowerCase().replace(/[:\s]/g, ''); // Remove spaces/colons for matching
        for (const key of totalKeywords) {
            const index = searchRegion.indexOf(key);
            if (index !== -1) {
                // Look for a number starting right after the keyword
                const afterKey = searchRegion.substring(index + key.length, index + key.length + 15);
                const numbers = afterKey.match(/\d+([,.]\d+)?/);
                if (numbers) {
                    amount = numbers[0].replace(',', '.');
                    break;
                }
            }
        }

        // Strategy B: Line-by-Line Search (Fallback)
        if (!amount) {
            for (let i = 0; i < rawLines.length; i++) {
                const line = rawLines[i].toLowerCase().replace(/\s+/g, '');
                if (totalKeywords.some(key => line.includes(key))) {
                    const numbers = line.match(/\d+([,.]\d+)?/g);
                    if (numbers) {
                        amount = numbers[numbers.length - 1].replace(',', '.');
                        break;
                    }
                }
            }
        }

        // Strategy C: Absolute Fallback (Largest number that's not a year)
        if (!amount) {
            const allNumbers = text.match(/\d+([,.]\d{2})|\d{2,}/g);
            if (allNumbers) {
                const numbers = allNumbers.map(n => parseFloat(n.replace(',', '.')))
                    .filter(n => n > 5 && n < 50000 && n !== 2024 && n !== 2025 && n !== 2026);
                if (numbers.length > 0) {
                    amount = Math.max(...numbers).toString();
                }
            }
        }

        // 3. Category Guessing
        let category = 'Shopping'; 
        const foodKeywords = ['饭', '店', '食', '餐', '菜', '肉', '鱼', '面', '汤', '饮', '酒', 'restaurant', 'cafe', 'bistro'];
        const shoppingKeywords = ['百貨', '藥妝', '生活', 'poya', '寶雅', '屈臣氏', '康是美', 'market', 'store', 'mall', 'super'];
        
        const fullTextLower = text.toLowerCase();
        if (foodKeywords.some(key => fullTextLower.includes(key))) category = 'Food';
        else if (shoppingKeywords.some(key => fullTextLower.includes(key))) category = 'Shopping';
        else if (fullTextLower.includes('coffee') || fullTextLower.includes('咖啡') || fullTextLower.includes('tea') || fullTextLower.includes('茶')) category = 'Drinks';

        return {
            amount,
            description: merchant || rawLines[0],
            category,
            type: 'expense'
        };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '10px 0' }}>
            {!previewImage ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--input-bg)', borderRadius: '24px', width: '100%', border: '2px dashed var(--glass-border)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-primary)' }}>
                        <Camera size={32} />
                    </div>
                    <h3 style={{ marginBottom: '8px' }}>Scan Receipt</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Snap a photo of your receipt to automatically extract details.
                    </p>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '12px 24px' }}
                    >
                        Open Camera
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        ref={fileInputRef} 
                        onChange={handleImageCapture} 
                        style={{ display: 'none' }} 
                    />
                </div>
            ) : (
                <div style={{ width: '100%', position: 'relative' }}>
                    <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ width: '100%', borderRadius: '20px', maxHeight: '400px', objectFit: 'contain', background: '#000' }} 
                    />
                    
                    {isScanning && (
                        <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            background: 'rgba(0,0,0,0.8)', borderRadius: '20px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: 'white', padding: '20px', textAlign: 'center'
                        }}>
                            <Loader2 className="spinning" size={48} />
                            <div style={{ marginTop: '16px', fontWeight: '800', fontSize: '16px', color: 'white' }}>
                                {statusText || 'Analyzing...'}
                            </div>
                            <div style={{ width: '70%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                    )}
                    
                    {!isScanning && (
                        <button 
                            onClick={() => { setPreviewImage(null); setProgress(0); setStatusText(''); }}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--card-bg)', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}
                        >
                            <RefreshCw size={24} color="var(--accent-primary)" />
                        </button>
                    )}
                </div>
            )}

            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: '600', padding: '10px' }}>
                Cancel
            </button>
        </div>
    );
};

export default ReceiptScanner;
