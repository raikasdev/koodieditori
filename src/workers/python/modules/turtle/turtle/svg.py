# Modified version of Brython's SVG module
# Author: Romain Casati
# License: GPL v3 or higher

import xml.etree.ElementTree as ET

_svg_ns = "http://www.w3.org/2000/svg"
_xlink_ns = "http://www.w3.org/1999/xlink"

_svg_tags = ['a',
             'altGlyph',
             'altGlyphDef',
             'altGlyphItem',
             'animate',
             'animateColor',
             'animateMotion',
             'animateTransform',
             'circle',
             'clipPath',
             'color_profile',  # instead of color-profile
             'cursor',
             'defs',
             'desc',
             'ellipse',
             'feBlend',
             'foreignObject',  # patch to enable foreign objects
             'g',
             'image',
             'line',
             'linearGradient',
             'marker',
             'mask',
             'path',
             'pattern',
             'polygon',
             'polyline',
             'radialGradient',
             'rect',
             'set',
             'stop',
             'svg',
             'text',
             'tref',
             'tspan',
             'use']


def _tag_func(tag):
    def func(*args, **kwargs):
        node = ET.Element(tag)
        # this is mandatory to display svg properly
        if tag == 'svg':
            node.set('xmlns', _svg_ns)
        for arg in args:
            if isinstance(arg, (str, int, float)):
                arg = ET.Element('text')
                arg.text = str(arg)
            node.append(arg)
        for key, value in kwargs.items():
            key = key.lower()
            #if key[0:2] == "on":
                # Event binding passed as argument "onclick", "onfocus"...
                # Better use method bind of DOMNode objects
                #node.addEventListener(key[2:], value)'
                # Not even implemented.
            if key == "style":
                node.set("style", ';'.join(f"{str(k)}: {str(v)}"
                                                    for k, v in value.items()))
            elif "href" in key:
                node.set("href", str(value))
            elif value is not False:
                # option.selected=false sets it to true :-)
                node.set(key.replace('_', '-'), str(value))
        return node
    return func


for tag in _svg_tags:
    vars()[tag] = _tag_func(tag)
