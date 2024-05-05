import {updateBadge} from "./badge.js";
import {background} from "./backgroundState.js";
import {commandListener} from "./openEditors.js";

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
chrome.commands.onCommand.addListener(commandListener);
chrome.windows.onRemoved.addListener(windowRemoved);

