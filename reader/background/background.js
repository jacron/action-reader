import {background} from './backgroundState.js';
import {initActions} from "./actions.js";
import {initView, closeView} from "./view.js";
// import {getJcReaderHost} from "./util.js";

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
//         const _activeHost = getJcReaderHost(info.url);
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
});

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
