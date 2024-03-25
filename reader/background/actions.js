import {Host, storeDefault, storeDark} from "./host.js";
import {reInjectMakeReader} from "./makeReader.js";
import {background} from './backgroundState.js';
import {getJcReaderHost} from "../lib/util.js";
import {StorageArea} from "./backgroundState.js";

function newHost(req, sendResponse) {
    StorageArea.set({[req.host]: {}}, () => {});
    sendResponse({data: 'ok'});
}

function saveHost(req, sendResponse) {
    const host = new Host(req.host);

    applyHost(req, sendResponse);
    switch (req.name) {
        case 'default':
            host.store({default: req.text});
            break;
        case 'dark':
            host.store({dark: req.text});
            break;
        case 'selector':
            host.store({selector: req.text});
            break;
        case '_default':
            storeDefault(req.text);
            break;
        case '_dark':
            storeDark(req.text);
            break;
    }
    sendResponse({data: 'ok'});
}

function injectCss(doc, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'replaceStyle',
        css: doc.text,
        id: doc.styleId
    });
}

function _applyHost(req, tabId, sendResponse) {
    if (~['default', 'dark', '_default', '_dark'].indexOf(req.name )) {
        injectCss(req, tabId);
    }
    if (req.name === 'selector') {
        reInjectMakeReader(req.text, tabId);
    }
    sendResponse({data: 'ok'});
}

function applyHost(req, sendResponse) {
    const tabId = background.tabId;
    if (!tabId) {
        chrome.tabs.query({
            active: true
        }, tabs => {
            _applyHost(req, tabs[0].id, sendResponse);
        })

    } else {
        _applyHost(req, tabId, sendResponse);
    }
}

function _initHost(req, tab, sendResponse) {
    const _activeHost = getJcReaderHost(tab.url);
    const host = new Host(_activeHost);
    host.getCustom().then(responseCustom => {
        host.getGeneral().then(responseGeneral => {
            const res = {
                message: 'onInitHost',
                host: _activeHost,
                custom: responseCustom[_activeHost],
                defaultText: responseGeneral['_default'],
                darkText: responseGeneral['_dark']
            };
            if (req.client === 'content') {
                chrome.tabs.sendMessage(tab.id, res);
            } else {
                chrome.runtime.sendMessage(res, () => {});
            }
            sendResponse(false);
        });
    }).catch(err => {
        console.error(err);
        sendResponse(false);
    });
}

function initHost(req, sendResponse) {
    console.log('*** initHost...')
    // console.log(sender.origin)
    // if (!sender.origin.startsWith('http')) {
    //     return;
    // }
    chrome.tabs.query({
        active: true,
    }, tabs => {
        // console.log(tabs)
        if (tabs.length > 0) {
            let tab;
            for (const t of tabs) {
                if (t.url.startsWith('http')) {
                    tab = t;
                    break;
                }
            }
            // console.log(tab)
            _initHost(req, tab, sendResponse);
        }
    });
    return true;
}

const actionBindings = {
    initHost,
    saveHost,
    applyHost,
    newHost,
};

function initActions(req, sendResponse, sender) {
    if (req.request) {
        // console.log('req', req);
        const fun = actionBindings[req.request];
        if (fun) {
            fun(req, sendResponse, sender);
        } else {
            console.error('invalid request', req.request);
            sendResponse('invalid request:' + req.request);
        }
    }
}

export {initActions}
