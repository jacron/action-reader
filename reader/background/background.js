import {initActions} from "./actions.js";
import {updateBadge} from "./badge.js";

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse, sender);
}

function activateListener(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, activeTab => updateBadge(activeTab.url));
}

function updateListener(_tabId, info) {
    if (info.status === 'loading') {
        updateBadge(info.url);
    }
}

chrome.tabs.onUpdated.addListener(updateListener);
chrome.tabs.onActivated.addListener(activateListener);
chrome.runtime.onMessage.addListener(messageListener);
