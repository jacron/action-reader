import {Host, storeDefault, storeDark, retrieveDefaultDark} from "./host.js";
import {injectCss, removeStyles, articleRemoveDark,
    articleAddDark} from "./styling.js";
import {reInjectMakeReader, removeReader} from "./makeReader.js";
import {background} from './backgroundState.js';
import {monacoDocuments} from "../shared/constants.js";
import {getJcReaderHost} from "./util.js";

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();  // empty changes
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

function deleteHost(req, sendResponse) {
    const host = new Host(req.host);
    host.delete();
    sendResponse({data: 'ok'});
}

function injectDefaultDark(_tabId) {
    retrieveDefaultDark().then(data => {
        monacoDocuments._default.text = data['_default'];
        monacoDocuments._dark.text = data['_dark'];
        injectCss(monacoDocuments._default, _tabId);
        injectCss(monacoDocuments._dark, _tabId);
    });
}

function reInit(name) {
    const host = new Host(name);
    host.get().then(data => {
        data = data[name];
        injectDefaultDark(background.tabId);
        monacoDocuments.default.text = data.default;
        monacoDocuments.dark.text = data.dark;
        monacoDocuments.selector.text = data.selector;
        injectCss(monacoDocuments.default, background.tabId);
        injectCss(monacoDocuments.dark, background.tabId);
        reInjectMakeReader(monacoDocuments.selector.text, background.tabId);
    })
}

function toggleGeneral(req, sendResponse) {
    const {mode, host} = req;
    if (mode === 'off') {
        removeStyles();
        removeReader(background.tabId);
        articleRemoveDark(background.tabId);
        sendResponse({data: 'general and custom styles and selector removed'});
    } else {
        reInit(host);
        sendResponse({data: 'general and custom styles and selector added'});
    }
}

function setActive(mode, name) {
    const host = new Host(name);
    // console.log(mode);
    host.store({active: mode});
}

function toggleActive(req, sendResponse) {
    const {mode, host} = req;
    setActive(mode, host);
    if (mode === 'off') {
        removeStyles();
        removeReader(background.tabId);
        articleRemoveDark(background.tabId);
        sendResponse({data: 'general and custom styles and selector removed'});
    } else {
        reInit(host);
        sendResponse({data: 'general and custom styles and selector added'});
    }
}

function toggleDark(req, sendResponse) {
    const {mode} = req;
    if (mode === 'off') {
        articleRemoveDark(background.tabId);
        sendResponse({data: 'dark styles removed'});
    } else {
        retrieveDefaultDark().then(data => {
            monacoDocuments.dark.text = data['_dark'];
            sendResponse({data: 'dark styles added'});
            articleAddDark(background.tabId);
        });
    }
}

function closePopup() {
    if (background.winId) {
        chrome.windows.remove(background.winId, () => {
            background.winId = null
        });
    }
}

function initHost(req, sendResponse, sender) {
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
            const _activeHost = getJcReaderHost(tab.url);
            const host = new Host(_activeHost);
            host.get().then(response => {
                retrieveDefaultDark().then(data => {
                    const res = {
                        message: 'onInitHost',
                        host: _activeHost,
                        custom: response[_activeHost],
                        defaultText: data['_default'],
                        darkText: data['_dark']
                    };
                    if (req.client === 'content') {
                        chrome.tabs.sendMessage(tab.id, res);
                    } else {
                        chrome.runtime.sendMessage(res);
                    }
                    sendResponse(false);
                });
            }).catch(err => {
                console.error(err);
                sendResponse(false);
            });
        }
    });
    return true;
}

const actionBindings = {
    // content, popup
    initHost,
    // popup
    saveHost,
    applyHost,
    closePopup,
    deleteHost,
    // toggleGeneral,
    toggleActive,
    // toggleDark,
    storeHost,
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
