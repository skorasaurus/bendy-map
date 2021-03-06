/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [40.7238, -73.9881, 14]; // NYC

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map', {
        "keyboardZoomOffset" : .05,
        scrollWheelZoom: true
    });

    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    // setView expects format ([lat, long], zoom)
    map.setView(map_start_location.slice(0, 3), map_start_location[2]);

    var hash = new L.Hash(map);

    // Create dat GUI
    var gui;
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;
        gui.rotate = .51;
        gui.add(gui, 'rotate', 0., Math.PI/180*360).name("&nbsp;&nbsp;rotate").onChange(function(value) {
            scene.styles.tilt.shaders.uniforms.u_rotate = value;
            scene.styles.roads.shaders.uniforms.u_rotate = value;
            scene.requestRedraw();
        });
        gui.height = 100;
        gui.add(gui, 'height', -500., 500).name("&nbsp;&nbsp;height").onChange(function(value) {
            scene.styles.tilt.shaders.uniforms.u_yoffset = value;
            scene.styles.roads.shaders.uniforms.u_yoffset = value;
            scene.requestRedraw();
        });

    }

    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        var url_search = window.location.search.slice(1);
        var noscroll = false;
        if (url_search.length > 0) {
            if (url_search.lastIndexOf('noscroll') > -1) noscroll = true;
        }
        layer.on('init', function() {
            if (!noscroll) {
                gui = new dat.GUI({ autoPlace: true, hideable: false, width: 300 });
                addGUI();
            }
        });
        layer.addTo(map);
        if (noscroll) map.scrollWheelZoom.disable();
    });

    return map;

}());
