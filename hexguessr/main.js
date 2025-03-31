function decToHex(decValue) {
    var hexValue = decValue.toString(16);
    if (hexValue.length == 1) {
        hexValue = "0" + hexValue
    }
    return hexValue
}

function colourGen() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    var colour = decToHex(r) + decToHex(g) + decToHex(b);
    var brightness = r + g + b;
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
    }
    else {
        document.documentElement.style.setProperty("--fontSize", "5vh");
    }
}

function submit() {
    colourGen();
    guess.value = "";
}

window.onload = load();
guess = document.getElementById("guess");