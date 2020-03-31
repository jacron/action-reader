import {dynClass, monacoDocuments} from "../shared/constants.js";
import {setEditor} from "./tab.js";

function initTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = monacoDocuments[tab];
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
}

function setActive(mode) {
    const switchActive = document.getElementById('active-toggle-switch');
    if (mode === 'off') {
        switchActive.classList.remove('on');
        switchActive.classList.add('off');
    }
}

function show(req) {
    const {custom, darkText, defaultText} = req;
    initTab('css');
    monacoDocuments.css.text = custom.css;
    monacoDocuments.selector.text = custom.selector;
    monacoDocuments.default.text = defaultText;
    monacoDocuments.dark.text = darkText;
    setEditor(monacoDocuments.css);
    setActive(custom.active);
}

export {show}
