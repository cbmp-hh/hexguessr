function decToHex(decValue) {
    var hexValue = decValue.toString(16);
    if (hexValue.length == 1) {
        hexValue = "0" + hexValue
    }
    return hexValue
}

function colourGen() {
    r = Math.floor(Math.random() * 255);
    g = Math.floor(Math.random() * 255);
    b = Math.floor(Math.random() * 255);
    colour = (decToHex(r) + decToHex(g) + decToHex(b)).toUpperCase();
    brightness = r + g + b;
    document.documentElement.style.setProperty("--backgroundColour", "#" + colour);

    if (brightness > 381) {
        document.documentElement.style.setProperty("--colour", "black");
    }
    else {
        document.documentElement.style.setProperty("--colour", "white");
    }
}

function load() {
    colourGen();
    if (document.documentElement.clientHeight > document.documentElement.clientWidth) {
        document.documentElement.style.setProperty("--fontSize", "5vw");
    } else {
        document.documentElement.style.setProperty("--fontSize", "5vh");
    }
}

function submit() {
    if (!/^([0-9A-F]{3}){1,2}$/.test(guess.value))/*thanks stackoverflow*/ {
        alert("Please enter a valid hex code. ");
        return;
    } 
    document.documentElement.style.setProperty("--guessColour", "#" + guess.value);
    submitButton.setAttribute("onclick", "retry()");
    submitButton.innerHTML = "Try again";
    colourDiv.insertAdjacentHTML("beforeend", `
<div id="results-container">
    <div class="results">
        <p>Your colour: </p>
        <div id="guess-colour"></div>
    </div>
    <div class="results"><p>Answer: #${colour}</p></div>
    <div class="results"><p>Colour difference: ${colourDifference(guess.value, colour)}</p></div>
</div>
    `);
}

function retry() {
    document.getElementById("results-container").remove();
    submitButton.setAttribute("onclick", "submit()");
    submitButton.innerHTML = "Submit";
    colourGen();
    guess.value = "";
}

function hexToLAB(hex) {
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    [r, g, b] = [r, g, b].map(v => v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92);
    let X = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
    let Y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
    let Z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;

    [X, Y, Z] = [X / 95.047, Y / 100.000, Z / 108.883].map(v => v > 0.008856 ? v ** (1/3) : (7.787 * v) + (16/116));
    return [(116 * Y) - 16, 500 * (X - Y), 200 * (Y - Z)];
}

function ciede2000(lab1, lab2) {
    let [L1, a1, b1] = lab1;
    let [L2, a2, b2] = lab2;

    let C1 = Math.sqrt(a1 * a1 + b1 * b1);
    let C2 = Math.sqrt(a2 * a2 + b2 * b2);
    let Cbar = (C1 + C2) / 2;

    let dL = L2 - L1;
    let da = a2 - a1;
    let db = b2 - b1;
    let dC = C2 - C1;
    let dH = Math.sqrt(da * da + db * db - dC * dC);

    let SL = 1 + 0.015 * (L1 + L2) / 2;
    let SC = 1 + 0.045 * Cbar;
    let SH = 1 + 0.015 * Cbar;

    return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2);
}

function colourDifference(hex1, hex2) {
    return ciede2000(hexToLAB(hex1), hexToLAB(hex2));
}
//trust AI 56-93

window.onload = load();
guess = document.getElementById("guess");
colourDiv = document.getElementById("colour");
submitButton = document.getElementById("submit");