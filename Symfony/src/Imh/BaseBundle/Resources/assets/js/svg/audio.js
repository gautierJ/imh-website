function collapseAudioBar(flag) {

    'use strict';

    var svgCollapse = document.getElementById('svg_audio-collapse');

    while (svgCollapse.firstChild) {
        svgCollapse.removeChild(svgCollapse.firstChild);
    }

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'matrix(1 0 0 -1 0 30)');

    svgCollapse.appendChild(g);

    for (var i=0; i<4; i++) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i*6);
        rect.setAttribute('width', '4');
        rect.setAttribute('height', '1');
        rect.setAttribute('rx', '2');

        var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animation.setAttributeNS(null, 'attributeName', 'height');
        animation.setAttributeNS(null, 'begin', 'indefinite');
        animation.setAttributeNS(null, 'end', 'indefinite');
        animation.setAttributeNS(null, 'dur', '2');
        animation.setAttributeNS(null, 'values', '25;2');
        animation.setAttributeNS(null, 'keyTimes', '0;1');
        animation.setAttributeNS(null, 'keySplines', '0,.31,.31,.82');
        animation.setAttributeNS(null, 'calcMode', 'spline');
        animation.setAttributeNS(null, 'repeatCount', '1');

        rect.appendChild(animation);
        g.appendChild(rect);

        // start/end the animations
        flag ? animation.beginElementAt(i/5) : animation.endElement();
    }
}

collapseAudioBar(false);



