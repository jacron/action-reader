import {injectStyle, removeStyle} from "../../content/content.js";
import {decomment, validateExactLength} from "../../content/util.js";
import {_createToggleButton} from "./button.js";

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

function createToggleStyleButton(options, lines, line) {
    const {caption, styleId, initial} = options;
    _createToggleButton(caption, initial, () => toggleStyle(styleId, lines, line));
}

function createToggleButton(options) {
    const {caption, selector, initial} = options;
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

function styleContaining(options, lines, line) {
    const realText = options.text.replace(/_/g, ' ');
    console.log('*** search content:' + realText)
    for (const element of document.querySelectorAll(options.selector)) {
        if (element.textContent === realText) {
            console.log('*** found', element);
            const rule = cssFromLines(lines, line).split('\n')[0];
            const w = rule.split(' ');
            if (w[0] === 'parent') {
                const parent = element.parentElement;
                parent.style[w[1]] = w[2] + ' !important';
            }
            break;
        }
    }
}

function parseFunction(line, lines, cb) {
    const declaration = decomment(line);
    const w = declaration.split(' ');
    switch (w[0]) {
        case '@toggle':
            if (!validateExactLength(w, 4)) return;
            createToggleButton({caption: w[1], selector: w[2], inital: w[3]});
            break;
        case '@toggle-style':
            if (!validateExactLength(w, 5)) return;
            createToggleStyleButton({caption: w[1], styleId: w[2], initial: w[3]}, lines, line);
            break;
        case  '@annoying':
            cb(cssFromLines(lines, line));
            break;
        case '@contains':
            if (!validateExactLength(w, 3)) return;
            styleContaining({selector: w[1], text: w[2]}, lines, line);
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
