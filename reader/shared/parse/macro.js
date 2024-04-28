import {decomment, validateExactLength, validateMinLength} from "../../content/util.js";
import {keysGeneral, StorageArea} from "../constants.js";
import {cssFromLines} from "./parse.js";
import {popup} from "../../popup/popupState.js";

function insertText(text) {
    const selection = popup.activeDoc.editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {identifier: id, range: selection, text: text, forceMoveMarkers: true};
    popup.activeDoc.editor.executeEdits("my-source", [op]);
}

function createMacroButton(nr, caption, text) {
    const button = document.createElement('button');
    button.textContent = caption.replace(/_/g, ' ');
    button.setAttribute('data-key', nr);
    button.setAttribute('title', '^' + nr);
    button.addEventListener('click', () => insertText(text));
    return button;
}

function _parseMacro(lines, line) {
    const declaration = decomment(line);
    const w = declaration.split(' ');
    if (!validateMinLength(w, 1)) return;
    const button = createMacroButton(w[1], w[2], cssFromLines(lines, line));
    document.getElementById('macros').appendChild(button);
}

function parseMacroInStyle() {
    StorageArea.get([keysGeneral.default], results => {
        const defaultStyle = results[keysGeneral.default];
        const lines = defaultStyle.split('\n');
        for (const line of lines) {
            if (line.startsWith('/* @macro')) {
                _parseMacro(lines, line);
            }
        }
    });
}

export {parseMacroInStyle}
