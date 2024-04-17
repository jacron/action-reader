import {Host, storeDark, storeDefault} from "../background/host.js";
import {background} from "../background/backgroundState.js";
import {popup} from "./popupState.js";
import {withActiveTab} from "../shared/activeTab.js";

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
    // sendResponse({data: 'ok'});
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
    // sendResponse({data: 'ok'});
}

function applyHost() {
    const tabId = background.tabId;
    if (!tabId) {
        // withActiveTab().then(tab => {
        //     _applyHost(tab.id);
        // })
        chrome.tabs.query({
            active: true
        }, tabs => {
            _applyHost(tabs[0].id);
        })

    } else {
        console.log('!!! background.tabId toch gezet !!!');
        _applyHost(tabId);
    }
}

export {saveHost, applyHost}
