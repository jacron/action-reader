import {setFormActions, formsExistingOrNew} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";

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

chrome.runtime.onMessage.addListener(messageListener);

function handleTabs() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

document.addEventListener('DOMContentLoaded', function () {
    setFormActions();
    handleTabs();
    initHost();
});
