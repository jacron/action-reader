import {updateBadge} from "./badge.js";
import {background} from "./backgroundState.js";
import {commandListener} from "./openEditors.js";

function activatedListener(info) {
    chrome.tabs.get(info.tabId, tab => updateBadge(tab.url));
}

function windowRemoved(winId) {
    if (background.winId === winId) {
        background.winId = null;
    }
}

function updatedListener(tabId) {
    if (tabId) {
        chrome.tabs.get(tabId, tab => updateBadge(tab.url));
    }
}

chrome.tabs.onActivated.addListener(activatedListener);
chrome.tabs.onUpdated.addListener(updatedListener);
chrome.commands.onCommand.addListener(commandListener);
chrome.windows.onRemoved.addListener(windowRemoved);


