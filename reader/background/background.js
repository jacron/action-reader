import {background} from './backgroundState.js';
import {initActions} from "./actions.js";
import {Host} from "./host.js";
import {getJcReaderHost} from "./util.js";

let lastActiveTabId;

function isActiveHost(response) {
    const entries = Object.entries(response);
    if (entries.length > 0) {
        const [site, options] = entries[0];
        if (site.length > 0 && options.active === 'on') {
            return true;
        }
    }
    return false;
}

function showBadge(activeHost) {
    const host = new Host(activeHost);
    console.log(host)
    if (host.name.length === 0) {  // maybe the popup
        return;
    }
    host.get().then(response => {
        chrome.action.setBadgeText({
            text: isActiveHost(response) ? 'on' : ''
        });
    });
}

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse, sender);
}

function removalListener(windowId) {
    if (windowId === background.winId) {
        background.winId = null;
    }
}

function updateListener(_tabId, info) {
    lastActiveTabId = _tabId;
    if (_tabId === background.tTabId) {
        return;
    }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            showBadge(_activeHost);
        }
    }
}

chrome.windows.onRemoved.addListener(removalListener);
chrome.tabs.onUpdated.addListener(updateListener);
chrome.runtime.onMessage.addListener(messageListener);
