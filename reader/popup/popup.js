import {handleFormClickActions, formsExistingOrNew} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monaco.js";
import {registerSuggestions} from "./suggestions.js";

function initHost() {
    chrome.runtime.sendMessage({
        request: 'initHost',
        client: 'popup'}, () => {});
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
}

function messageListener(req, sender, sendResponse) {
    if (req.message === 'onInitHost') {
        onInitHost(req);
        sendResponse('handled');
    } else {
        sendResponse('no request handled');
    }
}

function handleKeyboardDown() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            close();
        }
    })
}

function handleTabClickActions() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormClickActions();
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

