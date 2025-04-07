/**
 * CIEDE2000 Color-Difference Algorithm
 * Implementation of the CIEDE2000 color difference formula
 * https://en.wikipedia.org/wiki/Color_difference#CIEDE2000
 */

function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function ciede2000(color1, color2) {
    // Convert hex to Lab
    const lab1 = hexToLab(color1);
    const lab2 = hexToLab(color2);
    
    // Extract Lab values
    const L1 = lab1[0];
    const a1 = lab1[1];
    const b1 = lab1[2];
    const L2 = lab2[0];
    const a2 = lab2[1];
    const b2 = lab2[2];
    
    // Weighting factors (typically 1)
    const kL = 1;
    const kC = 1;
    const kH = 1;
    
    // Step 1: Calculate C1p, C2p
    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const C_avg = (C1 + C2) / 2;
    
    const G = 0.5 * (1 - Math.sqrt(Math.pow(C_avg, 7) / (Math.pow(C_avg, 7) + Math.pow(25, 7))));
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);
    
    // Step 2: Calculate h1p, h2p
    let h1p = 0;
    if (b1 !== 0 || a1p !== 0) {
        h1p = Math.atan2(b1, a1p);
        if (h1p < 0) h1p += 2 * Math.PI;
    }
    
    let h2p = 0;
    if (b2 !== 0 || a2p !== 0) {
        h2p = Math.atan2(b2, a2p);
        if (h2p < 0) h2p += 2 * Math.PI;
    }
    
    // Step 3: Calculate ΔLp, ΔCp, ΔHp
    const delta_Lp = L2 - L1;
    const delta_Cp = C2p - C1p;
    
    let delta_hp = 0;
    if (C1p * C2p !== 0) {
        if (Math.abs(h2p - h1p) <= Math.PI) {
            delta_hp = h2p - h1p;
        } else if (h2p - h1p > Math.PI) {
            delta_hp = h2p - h1p - 2 * Math.PI;
        } else {
            delta_hp = h2p - h1p + 2 * Math.PI;
        }
    }
    
    const delta_Hp = 2 * Math.sqrt(C1p * C2p) * Math.sin(delta_hp / 2);
    
    // Step 4: Calculate Lp_avg, Cp_avg, hp_avg
    const Lp_avg = (L1 + L2) / 2;
    const Cp_avg = (C1p + C2p) / 2;
    
    let hp_avg = 0;
    if (C1p * C2p !== 0) {
        if (Math.abs(h1p - h2p) <= Math.PI) {
            hp_avg = (h1p + h2p) / 2;
        } else if (h1p + h2p < 2 * Math.PI) {
            hp_avg = (h1p + h2p + 2 * Math.PI) / 2;
        } else {
            hp_avg = (h1p + h2p - 2 * Math.PI) / 2;
        }
    }
    
    // Step 5: Calculate T
    const T = 1 - 0.17 * Math.cos(hp_avg - degToRad(30)) +
              0.24 * Math.cos(2 * hp_avg) +
              0.32 * Math.cos(3 * hp_avg + degToRad(6)) -
              0.20 * Math.cos(4 * hp_avg - degToRad(63));
    
    // Step 6: Calculate delta_theta
    const delta_theta = degToRad(30) * Math.exp(-Math.pow((radToDeg(hp_avg) - 275) / 25, 2));
    
    // Step 7: Calculate RC
    const RC = 2 * Math.sqrt(Math.pow(Cp_avg, 7) / (Math.pow(Cp_avg, 7) + Math.pow(25, 7)));
    
    // Step 8: Calculate SL, SC, SH
    const SL = 1 + (0.015 * Math.pow(Lp_avg - 50, 2)) / Math.sqrt(20 + Math.pow(Lp_avg - 50, 2));
    const SC = 1 + 0.045 * Cp_avg;
    const SH = 1 + 0.015 * Cp_avg * T;
    
    // Step 9: Calculate RT
    const RT = -Math.sin(2 * delta_theta) * RC;
    
    // Step 10: Calculate ΔE00
    const delta_E = Math.sqrt(
        Math.pow(delta_Lp / (kL * SL), 2) +
        Math.pow(delta_Cp / (kC * SC), 2) +
        Math.pow(delta_Hp / (kH * SH), 2) +
        RT * (delta_Cp / (kC * SC)) * (delta_Hp / (kH * SH))
    );
    
    return delta_E;
}

// Helper functions for color conversion
function hexToLab(hex) {
    const rgb = hexToRgb(hex);
    const xyz = rgbToXyz(rgb);
    return xyzToLab(xyz);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToXyz(rgb) {
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    // Convert to XYZ using D65 illuminant
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    
    return { x: x * 100, y: y * 100, z: z * 100 };
}

function xyzToLab(xyz) {
    // D65 reference white
    const refX = 95.047;
    const refY = 100.0;
    const refZ = 108.883;
    
    let x = xyz.x / refX;
    let y = xyz.y / refY;
    let z = xyz.z / refZ;
    
    // Apply cube root
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);
    
    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    
    return [L, a, b];
}