import {styleIds} from "../shared/constants.js";

export function removeStyle(id) {
    const style = document.getElementById(id);
    if (style) style.parentNode.removeChild(style);
    // else console.log(id + ' is een onbekend style element')
}

export function injectStyle(css, id) {
    removeStyle(id);
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
}

export function removeMyStyles() {
    for (const theme in styleIds) {
        for (const styleId of Object.values(styleIds[theme])) {
            removeStyle(styleId);
        }
    }
}
