import {injectStyle, removeStyle} from "./content.js";
import {decomment, validateExactLength, validateMinLength} from "./util.js";

function createButton(caption, style, clickhandler) {
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.right = '10px';
    button.style.zIndex = '999';
    for (const key of Object.keys(style)) {
        button.style[key] = style[key];
    }
    button.textContent = caption;
    button.onclick = clickhandler;
    return button;
}

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

function createToggleButton(caption, selector, initial) {
    const button = createButton(caption.replace(/_/g, ' '), {
        top: '60px'
    }, () => {
        toggleElements(selector);
    });
    document.body.appendChild(button);
    console.log('*** ', initial);
    if (initial !== 'false') {
        setTimeout(() => {
            toggleElements(selector);
        }, 1000);
    }
}

function cssFromLines(lines, line) {
    // get the style for inserting/removing in head
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
    // console.log(styleLines);
    // injectStyle(styleLines.join('\n'), styleId);
    return styleLines.join(('\n'));
}

function toggleStyle(styleId, lines, line) {
    if (document.getElementById(styleId)) {
        removeStyle(styleId);
    } else {
        injectStyle(cssFromLines(lines, line), styleId);
    }
}

function createToggleStyleButton(caption, styleId, initial, lines, line) {
    const button = createButton(caption.replace(/_/g, ' '), {
        top: '60px'
    }, () => {
        toggleStyle(styleId, lines, line);
    });
    document.body.appendChild(button);
    console.log('*** ', initial);
    if (initial !== 'false') {
        setTimeout(() => {
            toggleStyle(styleId, lines, line);
        }, 1000);
    }
}

function parseFunction(line, lines) {
    // console.log(line) // /* @toggle sidebar #sidebar false */
    // of: /* @toggle hide_pro_icons article:has(span.sr-only) false */
    const declaration = decomment(line);
    const w = declaration.split(' ');
    if (!validateMinLength(w, 1)) return;
    if (w[0] === '@toggle') {
        if (!validateExactLength(w, 4)) return;
        createToggleButton(w[1], w[2], w[3]);
    }
    if (w[0] === '@toggle-style') {
        // /* @toggle-style sidebar style1 true begin */
        if (!validateExactLength(w, 5)) return;
        // caption, styleId, initial
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
