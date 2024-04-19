import {injectStyle, removeStyle} from "./content.js";
import {decomment, validateExactLength, validateMinLength} from "./util.js";
import {_createToggleButton} from "./button.js";

/*
@toggle:

@toggle sidebar #sidebar false
@toggle hide_pro_icons article:has(span.sr-only) false
caption, selector, initial

@toggle-style:

@toggle-style sidebar style1 true begin
caption, styleId, initial

 */

function toggleOneElement(element) {
    if (element.style.display === 'none') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

function toggleElements(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements) {
        for (const element of elements) {
            toggleOneElement(element);
        }
    }
}

function createToggleStyleButton(caption, styleId, initial, lines, line) {
    _createToggleButton(caption, initial, () => toggleStyle(styleId, lines, line));
}

function createToggleButton(caption, selector, initial) {
    _createToggleButton(caption, initial, () => toggleElements(selector));
}

function cssFromLines(lines, line) {
    const styleLines = [];
    let found = false;
    for (const _line of lines) {
        if (found) {
            if (_line.startsWith('@end')) {
                break;
            } else {
                styleLines.push(_line);
            }
        }
        if (line === _line) {
            found = true;
        }
    }
    return styleLines.join(('\n'));
}

function toggleStyle(styleId, lines, line) {
    if (document.getElementById(styleId)) {
        removeStyle(styleId);
    } else {
        injectStyle(cssFromLines(lines, line), styleId);
    }
}

function parseFunction(line, lines) {
    const declaration = decomment(line);
    const w = declaration.split(' ');
    if (!validateMinLength(w, 1)) return;
    if (w[0] === '@toggle') {
        if (!validateExactLength(w, 4)) return;
        createToggleButton(w[1], w[2], w[3]);
    }
    if (w[0] === '@toggle-style') {
        if (!validateExactLength(w, 5)) return;
        createToggleStyleButton(w[1], w[2], w[3], lines, line);
    }
}

function parseFunctionInStyle(style) {
    const lines = style.split('\n');
    for (const line of lines) {
        if (line.startsWith('/* @')) {
            parseFunction(line, lines);
        }
    }
}

export {parseFunctionInStyle}
