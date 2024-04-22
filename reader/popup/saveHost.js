import {Host} from "../background/host.js";
import {background} from "../background/backgroundState.js";
import {popup} from "./popupState.js";
import {StorageArea} from "../shared/constants.js";

const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';

function storeDefault(css) {
    StorageArea.set({[KEY_DEFAULT]: css}).then(() => {})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css}).then(() => {})
}

function saveHost() {
    const host = new Host(popup.activeHost);
    applyHost();
    const text = popup.activeDoc.text;
    switch (popup.activeDoc.name) {
        case 'default':
            host.store({default: text});
            break;
        case 'dark':
            host.store({dark: text});
            break;
        case 'selector':
            host.store({selector: text});
            break;
        case '_default':
            storeDefault(text);
            break;
        case '_dark':
            storeDark(text);
            break;
    }
}

function injectCss(tabId) {
    const {text, styleId} = popup.activeDoc;
    chrome.tabs.sendMessage(tabId, {
        message: 'replaceStyle',
        css: text,
        id: styleId
    });
}

function reInjectMakeReader(selector, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'reSelect',
        selector
    });
}

function _applyHost(tabId) {
    console.log('*** in _applyHost');
    const {text, name} = popup.activeDoc;
    if (~['default', 'dark', '_default', '_dark'].indexOf(name )) {
        injectCss(tabId);
    }
    if (name === 'selector') {
        reInjectMakeReader(text, tabId);
    }
}

function applyHost() {
    // NIET withActiveTab gebruiken!
    chrome.tabs.query({
        active: true
    }, tabs => {
        _applyHost(tabs[0].id);
    })
}

export {saveHost, applyHost}
