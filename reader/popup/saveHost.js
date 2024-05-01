import {Host} from "../background/host.js";
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
    const message = {
        message: 'replaceStyle',
        css: text,
        id: styleId
    }
    chrome.tabs.sendMessage(tabId, message).then()
        .catch(err => console.error('*** ' + err.message));
}

function reInjectMakeReader(selector, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'reSelect',
        selector
    }).then();
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
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, ([tab]) => {
        console.log(tab.url)
        _applyHost(tab.id);
    })
}

export {saveHost, applyHost}
