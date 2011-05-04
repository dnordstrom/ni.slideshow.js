# NI.Javascript.js
This is a set of slideshow classes for Prototype.js Javascript framework using the Script.aculo.us Effects add-on. It has been developed and tested with Prototype.js version 1.7 and Script.aculo.us version 1.9.

# Installation

Simply include the Javascript file after you have included Prototype.js and Script.aculo.us + Effects.

    <script src="//ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js"></script>
    <script>window.Prototype || document.write("<script src='js/prototype-1.7.js'>\x3C/script>")</script>
    <script src="js/scriptaculous-1.9.js"></script>
    <script src="js/effects-1.9.js"></script>
    <script src="js/ni.slideshow-0.1.js"></script>

The code above uses the Google CDN to fetch Prototype.js. For performance reasons I recommend combining and minifying your Javascript files. [Read more about minifying Javascript](http://developer.yahoo.com/performance/rules.html#minify "Read more about minifying Javascript").

# Usage

    var slideshow = new NI.Slideshow('slideshow_container', { slideDuration: 10 });
    slideshow.start();
    
More coming soon.

# Demo

Demo coming soon.