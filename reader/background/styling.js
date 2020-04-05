import {monacoDocuments} from "../shared/constants.js";
import {background} from './backgroundState.js';

function articleAddDark(tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'addDark'
    })
}

function articleRemoveDark(tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'removeDark'
    })
}

function injectCss(doc, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'replaceStyle',
        css: doc.text,
        id: doc.styleId
    });
}

function removeStyle(doc, tabId) {
    // console.log(doc, tabId);
    chrome.tabs.sendMessage(tabId, {
        message: 'voidStyle',
        id: doc.styleId
    });
}

function removeStyles() {
    removeStyle(monacoDocuments.default, background.tabId);
    removeStyle(monacoDocuments.dark, background.tabId);
    removeStyle(monacoDocuments._default, background.tabId);
    removeStyle(monacoDocuments._dark, background.tabId);
}

export {articleAddDark, injectCss, removeStyles, removeStyle, articleRemoveDark}
