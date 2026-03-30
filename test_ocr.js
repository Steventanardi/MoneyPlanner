import Tesseract from 'tesseract.js';
import path from 'path';

// Use the user-provided receipt image
const imagePath = 'd:\\Money Planner\\test_receipt.png';

console.log('Testing OCR on:', imagePath);
console.log('---');

Tesseract.recognize(
    imagePath,
    'chi_tra+eng',
    {
        logger: m => {
            if (m.status === 'recognizing text') {
                process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`);
            }
        }
    }
).then(({ data: { text } }) => {
    console.log('\n\n=== RAW OCR TEXT ===');
    console.log(text);
    console.log('=== END RAW TEXT ===\n');
    
    // Now test parsing
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log('=== PARSED LINES ===');
    lines.forEach((line, i) => console.log(`${i}: "${line}"`));
    console.log('=== END LINES ===\n');
    
}).catch(err => {
    console.error('OCR Error:', err);
});
