import {handleFormClickActions, formsExistingOrNew} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";
import {getJcReaderHost} from "../lib/util.js";
import {Host} from "../background/host.js";

// function fetchData() {
//     withActiveTab((tab) => {
//         const _activeHost = getJcReaderHost(tab.url);
//         const host = new Host(_activeHost);
//         host.getCustom().then(responseCustom => {
//             host.getGeneral().then(responseGeneral => {
//                 const res = {
//                     message: 'onInitHost',
//                     host: _activeHost,
//                     custom: responseCustom[_activeHost],
//                     defaultText: responseGeneral['_default'],
//                     darkText: responseGeneral['_dark']
//                 };
//                 onInitHost(res);
//             });
//         }).catch(err => {
//             console.error(err);
//         });
//     })
// }

function initHost() {
    /* nieuwe aanpak zal zonder background zijn, direct naar content.js */
    // eerst testen of message wordt ontvangen
    // console.log(chrome)
    // _initHost();
    /* nee, laat ik zelf mijn gegevens ophalen die ik nodig heb! */
    // fetchData();
    /* hier staat nog de oude aanroep van background/actions */
    chrome.runtime.sendMessage({
        request: 'initHost',
        client: 'popup'}, () => {});
}

function onInitHost(req) {
    console.log(req);
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
});

chrome.runtime.onMessage.addListener(messageListener);

