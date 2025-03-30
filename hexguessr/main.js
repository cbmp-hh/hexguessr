function colourgen() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    var colour = decimal.toString(r) + decimal.toString(g) + decimal.toString(b);
    var brightness = r + g + b;
    document.documentElement.style.setProperty("--backgroundColour", "#" + colour);

    if (brightness > 381) {
        document.documentElement.style.setProperty("--colour", "black");
    }
    else {
        document.documentElement.style.setProperty("--colour", "white");
    }
}

window.onload = colourgen;