import {initActions} from "./actions.js";
import {updateBadge} from "./badge.js";
import {messageToContent} from "../shared/popuplib.js";
import {openEditors} from "./openEditors.js";

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse, sender);
}

function activateListener(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, activeTab => updateBadge(activeTab.url));
}

function updateListener(_tabId, info) {
    if (info.status === 'loading' || info.status === 'complete') {
        updateBadge(info.url);
    }
}

function commandListener(command) {
    switch(command) {
        case 'open-editors':
            openEditors();
            break;
        case 'toggle-reader':
            messageToContent({message: 'toggleReader'})
            break;
        case 'toggle-dark':
            messageToContent({message: 'toggleDark'})
            break;
    }
}

chrome.tabs.onUpdated.addListener(updateListener);
chrome.tabs.onActivated.addListener(activateListener);
chrome.runtime.onMessage.addListener(messageListener);
chrome.commands.onCommand.addListener(commandListener);
