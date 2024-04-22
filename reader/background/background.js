import {updateBadge} from "./badge.js";
import {background} from "./backgroundState.js";
import {closeEditors, commandListener} from "./openEditors.js";
import {getJcReaderHost} from "../lib/util.js";

function activateListener(activeInfo) {
    // if leaving the tab you're editing, close the editors
    if (activeInfo.tabId !== background.tTabId) {
        closeEditors();
    }
    // update the badge
    chrome.tabs.get(activeInfo.tabId, activeTab => {
        if (activeTab) {
            updateBadge(activeTab.url)
        }
    });
}

function updateListener(_tabId, info) {
    if (info.status === 'loading' || info.status === 'complete') {
        updateBadge(info.url);
    }
    // if leaving the website you're editing, close the editors
    if (info.status === 'loading') {
        if (_tabId === background.activeTab.tabId) {
            const hostName = getJcReaderHost(info.url);
            if (hostName !== background.activeTab.hostName) {
                closeEditors();
            }
        }
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
