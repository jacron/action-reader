import {Host, storeDefault, storeDark, retrieveDefaultDark} from "./host.js";
import {injectCss, removeStyles, removeStyle, articleRemoveDark,
    articleAddDark} from "./styling.js";
import {reInjectMakeReader, removeReader} from "./makeReader.js";
import {app} from './state.js';
import {monacoDocuments} from "../shared/constants.js";

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();
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
        injectCss(req, app.tabId);
    }
    if (req.name === 'selector') {
        reInjectMakeReader(req.text, app.tabId);
    }
    sendResponse({data: 'ok'});
}

function getInitial(req, sendResponse) {
    sendResponse({activeHost: app.activeHost});
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
        // articleAddDark(_tabId);
    });
}

function reInit(name) {
    const host = new Host(name);
    host.get().then(data => {
        data = data[name];
        injectDefaultDark(app.tabId);
        monacoDocuments.css.text = data.css;
        monacoDocuments.selector.text = data.selector;
        injectCss(monacoDocuments.css, app.tabId);
        articleAddDark(app.tabId);
        reInjectMakeReader(monacoDocuments.selector.text, app.tabId);
    })
}
function toggleGeneral(req, sendResponse) {
    const {mode, host} = req;
    if (mode === 'off') {
        removeStyles();
        removeReader(app.tabId);
        articleRemoveDark(app.tabId);
        sendResponse({data: 'general and custom styles and selector removed'});
    } else {
        reInit(host);
        sendResponse({data: 'general and custom styles and selector added'});
    }
}

function toggleDark(req, sendResponse) {
    const {mode} = req;
    if (mode === 'off') {
        removeStyle(monacoDocuments.dark, app.tabId);
        articleRemoveDark(app.tabId);
        sendResponse({data: 'dark styles removed'});
    } else {
        articleAddDark(app.tabId);
        retrieveDefaultDark().then(data => {
            monacoDocuments.dark.text = data['_dark'];
            injectCss(monacoDocuments.dark, app.tabId);
            sendResponse({data: 'dark styles added'});
        });
    }
}

function toggleSelectorTool(req, sendResponse) {
    if (req.mode === 'on') {
        console.log('mode', req.mode);
        chrome.tabs.executeScript(app.tabId,{
            code: 'document.addEventListener(\'click\', scanDom);\n'
        }, () => {sendResponse('tool set off')});
    } else {
        chrome.tabs.executeScript(app.tabId,{
            code: 'document.removeEventListener(\'click\', scanDom);\n' +
                'document.body.removeChild(document.getElementById(\'elements-dump\'));\n'
        }, () => {sendResponse('tool set off')});
    }
}

function closePopup() {
    if (app.winId) {
        chrome.windows.remove(app.winId, () => {
            app.winId = null
        });
    }
}


function initActions(req, sendResponse) {
    const bindings = {
        fetchHost,
        getInitial,
        saveHost,
        applyHost,
        closePopup,
        deleteHost,
        toggleGeneral,
        toggleDark,
        toggleSelectorTool,
        storeHost,
    };
    if (req.request) {
        // console.log('req.request', req.request);
        const fun = bindings[req.request];
        if (fun) {
            fun(req, sendResponse);
        } else {
            console.error('invalid request', req.request);
            sendResponse('invalid request:' + req.request);
        }
    }
}

export {initActions}
