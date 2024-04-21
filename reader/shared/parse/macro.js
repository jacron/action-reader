import {decomment, validateExactLength, validateMinLength} from "../../content/util.js";
import {keysGeneral, StorageArea} from "../../content/constants.js";
import {cssFromLines} from "./parse.js";

function macroFromLines(lines, line, nr) {
    const declaration = decomment(line);
    const w = declaration.split(' ');
    if (!validateMinLength(w, 1)) return;
    if (w[0] === '@macro' && +w[1] === nr) {
        if (!validateExactLength(w, 3)) return null;
        return cssFromLines(lines, line);
    }
    return null;
}

function parseMacro(nr) {
    return new Promise((resolve, reject) => {
        StorageArea.get([keysGeneral.default], results => {
            const defaultStyle = results[keysGeneral.default];
            const lines = defaultStyle.split('\n');
            for (const line of lines) {
                if (line.startsWith('/* @')) {
                    const text = macroFromLines(lines, line, nr);
                    if (text) {
                        resolve(text);
                        return;
                    }
                }
            }
            reject();
        });
    })
}

function parseMacroInStyle(style) {

}

export {parseMacro, parseMacroInStyle}
