import {handleFormClickActions, formsExistingOrNew, save, apply, handleFormKeydown} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monacoSettings.js";
import {registerSuggestions} from "./suggestions.js";
import {insertText} from "./editor.js";
import {Host} from "../background/host.js";

function initHost() {
    chrome.runtime.sendMessage({
        request: 'initHost',
        client: 'popup'}, () => {});
}

function getHostDelay(hostName) {
    return new Promise((resolve) => {
        const host = new Host(hostName);
        host.getCustom().then(results => {
            const obj = results[hostName];
            if (obj) {
                resolve(obj.delay);
            }
        })
    })
}

function initDelay(hostName) {
    getHostDelay(hostName).then(delay => {
        const inputDelay = document.getElementById('editor-input-delay');
        inputDelay.value = delay || '';
    })
}

function onInitHost(req) {
    popup.activeHost = req.host;
    document.getElementById('host-name').innerText = req.host;
    formsExistingOrNew(req.custom);
    if (req.custom) {
        initTabs(req);
        initSuperTabs();
    } else {
        document.getElementById('new-host-name').innerText = req.host;
    }
    initDelay(req.host);
}

function dataToText(data) {
    const {targetClasses, targetId} = data;
    let text = targetClasses.join('.');
    if (text.length) {
        text = '.' + text;
    }
    if (targetId) {
        text += '#' + targetId;
    }
    console.log(text);
    return text + '\n';
}

function messageListener(req, sender, sendResponse) {
    switch(req.message) {
        case 'onInitHost':
            onInitHost(req);
            sendResponse('handled');
            break;
        case 'contextMenuClickTarget':
            insertText(dataToText(req.data));
            sendResponse('handled');
            break;
        default:
            sendResponse('no request handled');
    }
    return true;
}

function handleKeyboardDown() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            close();
        }
        if (e.metaKey && e.shiftKey && e.key === 's') {
            // console.log('CmdShS gedrukt')
            save();
            e.preventDefault()
        }
        if (e.metaKey && e.shiftKey && e.key === 'a') {
            // console.log('CmdShA gedrukt')
            apply();
            e.preventDefault()
        }
    })
}

function handleTabClickActions() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormClickActions();
    handleFormKeydown();
    handleTabClickActions();
    handleKeyboardDown();
    initHost();
    /* require werkt hier dankzij monaco library */
    require.config({ paths: {
            vs: vsPath,
        }});
    registerSuggestions();
});

chrome.runtime.onMessage.addListener(messageListener);

