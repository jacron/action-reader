import {setFormActions, toggleForms} from './form.js';
import {show} from './editor.js';
import {setTabActions} from './tab.js';
import {popup} from "./popupState.js";

function initHost() {
    chrome.runtime.sendMessage({
        request: 'initHost',
        client: 'popup'}, () => {});
}

function onInitHost(req) {
    popup.activeHost = req.host;
    document.getElementById('host-name').innerText = req.host;
    toggleForms(req.custom);
    if (req.custom) {
        show(req);
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

document.addEventListener('DOMContentLoaded', function () {
    setFormActions();
    setTabActions();
    initHost();
});
