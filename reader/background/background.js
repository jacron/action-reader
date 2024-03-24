import {initActions} from "./actions.js";
import {updateBadge} from "./badge.js";
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
    if (command === 'open-editors') {
        openEditors();
    }
}

chrome.tabs.onUpdated.addListener(updateListener);
chrome.tabs.onActivated.addListener(activateListener);
chrome.runtime.onMessage.addListener(messageListener);
chrome.commands.onCommand.addListener(commandListener);
