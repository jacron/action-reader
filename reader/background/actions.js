import {Host, storeDefault, storeDark, retrieveDefaultDark} from "./host.js";
import {injectCss, removeStyles, removeStyle, articleRemoveDark,
    articleAddDark} from "./styling.js";
import {reInjectMakeReader, removeReader} from "./makeReader.js";
import {background} from './backgroundState.js';
import {monacoDocuments} from "../shared/constants.js";

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();  // empty changes
    sendResponse({data: 'ok'});
}

function saveHost(req, sendResponse) {
    const host = new Host(req.host);

    applyHost(req, sendResponse);
    switch (req.name) {
        case 'css':
            // host.setCss(req.doc.text);
            host.store({css: req.text});
            break;
        case 'selector':
            host.store({selector: req.text});
            break;
        case 'default':
            storeDefault(req.text);
            break;
        case 'dark':
            storeDark(req.text);
            break;
    }
    sendResponse({data: 'ok'});
}

function applyHost(req, sendResponse) {
    // console.log('req (apply)', req);
    if (~['css', 'default', 'dark'].indexOf(req.name )) {
        injectCss(req, background.tabId);
    }
    if (req.name === 'selector') {
        reInjectMakeReader(req.text, background.tabId, background.activeHost);
    }
    sendResponse({data: 'ok'});
}

function getInitial(req, sendResponse) {
    sendResponse({activeHost: background.activeHost});
}

function deleteHost(req, sendResponse) {
    const host = new Host(req.host);
    host.delete();
    sendResponse({data: 'ok'});
}

function fetchHost(req, sendResponse) {
    const host = new Host(req.host);
    host.get().then(response => {
        retrieveDefaultDark().then(data => {
            chrome.runtime.sendMessage({
                host: req.host,
                result: response,
                defaultText: data['_default'],
                darkText: data['_dark']
            });
        });
    }).catch(err => console.error(err));
    sendResponse({data: 'ok'});
}

function injectDefaultDark(_tabId) {
    retrieveDefaultDark().then(data => {
        monacoDocuments.default.text = data['_default'];
        monacoDocuments.dark.text = data['_dark'];
        injectCss(monacoDocuments.default, _tabId);
        injectCss(monacoDocuments.dark, _tabId);
    });
}

function reInit(name) {
    const host = new Host(name);
    host.get().then(data => {
        data = data[name];
        injectDefaultDark(background.tabId);
        monacoDocuments.css.text = data.css;
        monacoDocuments.selector.text = data.selector;
        injectCss(monacoDocuments.css, background.tabId);
        articleAddDark(background.tabId);
        reInjectMakeReader(monacoDocuments.selector.text,
            background.tabId, background.activeHost);
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
        removeStyle(monacoDocuments.dark, background.tabId);
        articleRemoveDark(background.tabId);
        sendResponse({data: 'dark styles removed'});
    } else {
        articleAddDark(background.tabId);
        retrieveDefaultDark().then(data => {
            monacoDocuments.dark.text = data['_dark'];
            injectCss(monacoDocuments.dark, background.tabId);
            sendResponse({data: 'dark styles added'});
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

function bodyStyle(req, sendResponse) {
    // console.log(req);
    sendResponse({
        bodyStyle: {
            color: '#eeeeee'
        }
    })
}

const actionBindings = {
    fetchHost,
    getInitial,
    saveHost,
    applyHost,
    closePopup,
    deleteHost,
    toggleGeneral,
    toggleActive,
    toggleDark,
    storeHost,
    bodyStyle,
};

function initActions(req, sendResponse) {
    if (req.request) {
        const fun = actionBindings[req.request];
        if (fun) {
            fun(req, sendResponse);
        } else {
            console.error('invalid request', req.request);
            sendResponse('invalid request:' + req.request);
        }
    }
}

export {initActions}
