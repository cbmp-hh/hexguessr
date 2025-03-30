function colourgen() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    var colour = r.toString(16) + g.toString(16) + b.toString(16);
    var brightness = r + g + b;
    document.documentElement.style.setProperty("--backgroundColour", "rgb(" + r + ", " + g + ", " + b + ")");

    if (brightness > 381) {
        document.documentElement.style.setProperty("--colour", "black");
    }
    else {
        document.documentElement.style.setProperty("--colour", "white");
    }
}

function submit() {
    colourgen();
    guess.value = "";
}

guess = document.getElementById("guess");