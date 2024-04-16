import {Host, storeDefault, storeDark} from "./host.js";
import {background} from './backgroundState.js';
import {getJcReaderHost} from "../lib/util.js";
import {StorageArea} from "./backgroundState.js";
import {withActiveTab} from "../shared/activeTab.js";

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

function reInjectMakeReader(selector, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'reSelect',
        selector
    });
}

function _applyHost(req, tabId, sendResponse) {
    console.log('*** in _applyHost')
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

function _initHost(req, _activeHost, sendResponse) {
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
            chrome.runtime.sendMessage(res, () => {});
            sendResponse(false);
        });
    }).catch(err => {
        console.error(err);
        sendResponse(false);
    });
}

function initHost(req, sendResponse) {
    console.log('*** initHost in actions.js...')
    withActiveTab().then(tab => {
        const _activeHost = getJcReaderHost(tab.url);
        _initHost(req, _activeHost, sendResponse);
    })
    return true;
}

const actionBindings = {
    saveHost,
    applyHost,
    newHost,
};

function initActions(req, sendResponse, sender) {
    if (req.request) {  // req: client, request
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
