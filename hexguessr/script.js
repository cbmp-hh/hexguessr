function deltaE2000(rgb1, rgb2) {
    function rgb2lab(rgb) {
        let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        
        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
        
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
    }
    
    const lab1 = rgb2lab(rgb1);
    const lab2 = rgb2lab(rgb2);
    
    const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
    const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
    
    const kL = 1, kC = 1, kH = 1;
    
    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    
    const aC1C2 = (C1 + C2) / 2.0;
    
    const G = 0.5 * (1 - Math.sqrt(Math.pow(aC1C2, 7) / (Math.pow(aC1C2, 7) + Math.pow(25, 7))));
    
    const a1p = (1.0 + G) * a1;
    const a2p = (1.0 + G) * a2;
    
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);
    
    const h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
    const h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
    
    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    
    let dhp;
    if (C1p * C2p === 0) {
        dhp = 0;
    } else {
        dhp = h2p - h1p;
        if (dhp > 180) {
            dhp -= 360;
        } else if (dhp < -180) {
            dhp += 360;
        }
    }
    
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);
    
    const aL = (L1 + L2) / 2.0;
    const aCp = (C1p + C2p) / 2.0;
    
    let aHp;
    if (C1p * C2p === 0) {
        aHp = h1p + h2p;
    } else {
        if (Math.abs(h1p - h2p) <= 180) {
            aHp = (h1p + h2p) / 2.0;
        } else if (h1p + h2p < 360) {
            aHp = (h1p + h2p + 360) / 2.0;
        } else {
            aHp = (h1p + h2p - 360) / 2.0;
        }
    }
    
    const T = 1 - 0.17 * Math.cos((aHp - 30) * Math.PI / 180) + 
              0.24 * Math.cos(2 * aHp * Math.PI / 180) + 
              0.32 * Math.cos((3 * aHp + 6) * Math.PI / 180) - 
              0.20 * Math.cos((4 * aHp - 63) * Math.PI / 180);
    
    const dTheta = 30 * Math.exp(-Math.pow((aHp - 275) / 25, 2));
    
    const RC = 2 * Math.sqrt(Math.pow(aCp, 7) / (Math.pow(aCp, 7) + Math.pow(25, 7)));
    
    const SL = 1 + (0.015 * Math.pow(aL - 50, 2)) / Math.sqrt(20 + Math.pow(aL - 50, 2));
    const SC = 1 + 0.045 * aCp;
    const SH = 1 + 0.015 * aCp * T;
    
    const RT = -Math.sin(2 * dTheta * Math.PI / 180) * RC;
    
    const dE = Math.sqrt(Math.pow(dLp / (kL * SL), 2) + 
              Math.pow(dCp / (kC * SC), 2) + 
              Math.pow(dHp / (kH * SH), 2) + 
              RT * (dCp / (kC * SC)) * (dHp / (kH * SH)));
    
    return dE;
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const body = document.body;
const guessInput = document.getElementById('guessInput');
const actionButton = document.getElementById('actionButton');
const resultContainer = document.getElementById('resultContainer');
const resultDiv = document.getElementById('result');
const actualColorBox = document.getElementById('actualColor');
const guessedColorBox = document.getElementById('guessedColor');

let currentColor = '';
let isGuessing = true;

function initGame() {
    currentColor = getRandomColor();
    body.style.backgroundColor = currentColor;
    guessInput.value = '';
    resultContainer.classList.add('hidden');
    actionButton.textContent = 'Guess';
    isGuessing = true;
}

actionButton.addEventListener('click', function() {
    if (isGuessing) {
        const userGuess = guessInput.value.trim().toUpperCase();
        
        if (!/^#[0-9A-F]{6}$/i.test(userGuess)) {
            resultDiv.textContent = 'Please enter a valid hex color (e.g., #RRGGBB)';
            resultContainer.classList.remove('hidden');
            return;
        }
        
        const actualRgb = hexToRgb(currentColor);
        const guessedRgb = hexToRgb(userGuess);
        const difference = deltaE2000(actualRgb, guessedRgb);
        
        actualColorBox.style.backgroundColor = currentColor;
        guessedColorBox.style.backgroundColor = userGuess;
        resultDiv.textContent = `Color difference: ${difference.toFixed(2)} (lower is better)`;
        resultContainer.classList.remove('hidden');
        actionButton.textContent = 'Next';
        isGuessing = false;
    } else {
        initGame();
    }
});

guessInput.addEventListener('input', function() {
    let value = this.value.toUpperCase();
    if (value.length > 0 && value[0] !== '#') {
        value = '#' + value;
    }
    value = value.replace(/[^#0-9A-F]/g, '');
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    this.value = value;
});

initGame();