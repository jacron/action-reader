import {background} from './backgroundState.js';
import {initActions} from "./actions.js";
import {initView, closeView} from "./view.js";
import {Host} from "./host.js";
import {getJcReaderHost} from "./util.js";

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === background.winId) {
        background.winId = null;
    }
});

let lastActiveTabId;

// chrome.tabs.onUpdated.addListener((_tabId, info) => {
//     lastActiveTabId = _tabId;
//     if (_tabId === background.tTabId) {
//         return;
//     }
//     /** do not use the globals tabId and activeHost here */
//     if (info.status === 'loading') {
//         const _activeHost = getJcReaderHost(info.systemLibraryUrl);
//         if (_activeHost) {
//             // initExistingHost(_activeHost, _tabId);
//         }
//     }
// });
//
chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeInfo.tabId !== lastActiveTabId) {
        closeView();
    }
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        if (tabs[0]) {
            const {url, id} = tabs[0];
            background.activeUrl = url;
            background.tabId = id;
            background.activeHost = getJcReaderHost(url);
            showBadge();
        }
    });
});

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

function showBadge() {
    const host = new Host(background.activeHost);
    host.get().then(response => {
        chrome.browserAction.setBadgeText({
            text: isActiveHost(response) ? '1' : ''
        });
    });
}

chrome.browserAction.onClicked.addListener(function() {
    if (background.winId === null) {  /** prevent multiple popups */
        initView();
    } else {
        closeView();
    }
});

// chrome.cookies.onChanged.addListener(info => {
    // if (info.cause === 'explicit') {
    //     const {name, domain, value} = info.cookie;
    //     console.log(name, domain);
    //     console.log(value);
    // }
// });

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    initActions(req, sendResponse);
});
