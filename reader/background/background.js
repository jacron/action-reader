import {background} from './backgroundState.js';
import {initActions} from "./actions.js";
import {initView, closeView} from "./view.js";
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
    if (host.name.length === 0) {  // may be the popup
        return;
    }
    host.get().then(response => {
        chrome.browserAction.setBadgeText({
            text: isActiveHost(response) ? '1' : ''
        });
    });
}

function messageListener(req, sender, sendResponse) {
    // console.log(sender)
    initActions(req, sendResponse, sender);
}

function actionListener() {
    if (background.winId === null) {  /** prevent multiple popups */
    initView();
    } else {
        closeView();
    }
}

function activationListener(activeInfo) {
    if (activeInfo.tabId !== lastActiveTabId) {
        closeView();
    }
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        if (tabs[0]) {
            const {url} = tabs[0];
            showBadge(getJcReaderHost(url));
        }
    });
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
chrome.tabs.onActivated.addListener(activationListener);
chrome.browserAction.onClicked.addListener(actionListener);
chrome.runtime.onMessage.addListener(messageListener);
