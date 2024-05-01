import {updateBadge} from "./badge.js";
import {background} from "./backgroundState.js";
import {closeEditors, commandListener} from "./openEditors.js";

function activateListener(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, activeTab => {
        if (activeTab) {
            // console.log(activeTab.id)
            // console.log(background.tTabId)
            if (activeTab.id !== background.tTabId) {
                closeEditors();
            }
            updateBadge(activeTab.url)
        }
    });
}

function updateListener(_tabId, info) {
    if (info.status === 'loading' || info.status === 'complete') {
        updateBadge(info.url);
    }
}

function windowRemoved(winId) {
    if (background.winId === winId) {
        background.winId = null;
    }
}

chrome.tabs.onUpdated.addListener(updateListener);
chrome.tabs.onActivated.addListener(activateListener);
chrome.commands.onCommand.addListener(commandListener);
chrome.windows.onRemoved.addListener(windowRemoved);

