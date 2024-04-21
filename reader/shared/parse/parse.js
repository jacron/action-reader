import {injectStyle, removeStyle} from "../../content/content.js";
import {decomment, validateExactLength} from "../../content/util.js";
import {_createToggleButton} from "../../content/button.js";

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

function storeAnnoying(lines, line, cb) {
    cb(cssFromLines(lines, line));
}

function parseFunction(line, lines, cb) {
    const declaration = decomment(line);
    const w = declaration.split(' ');
    switch (w[0]) {
        case '@toggle':
            if (!validateExactLength(w, 4)) return;
            createToggleButton(w[1], w[2], w[3]);
            break;
        case '@toggle-style':
            if (!validateExactLength(w, 5)) return;
            createToggleStyleButton(w[1], w[2], w[3], lines, line);
            break;
        case  '@annoying':
            storeAnnoying(lines, line, cb);
            break;
    }
}

function parseFunctionInStyle(customStyle, cb) {
    const lines = customStyle.split('\n');
    for (const line of lines) {
        if (line.startsWith('/* @')) {
            parseFunction(line, lines, cb);
        }
    }
}

export {parseFunctionInStyle, cssFromLines}
