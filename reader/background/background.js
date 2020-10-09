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

chrome.tabs.onUpdated.addListener((_tabId, info) => {
    lastActiveTabId = _tabId;
    if (_tabId === background.tTabId) {
        return;
    }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            // initExistingHost(_activeHost, _tabId);
            showBadge(_activeHost);
        }
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
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

function showBadge(activeHost) {
    const host = new Host(activeHost);
    // console.log('host', host);
    if (host.name.length === 0) {  // may be the popup
        return;
    }
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



// function createIconBookmark(info) {
//     console.log({info});
//     chrome.runtime.sendMessage({
//         message: 'contextmenuclicked'
//     })
// }
//
// chrome.contextMenus.onClicked.addListener(createIconBookmark);
//
//
// // testing outside of async
// chrome.runtime.sendMessage({
//     message: 'contextmenuclicked'
// })
//
// function createContextMenu(id) {
//     chrome.contextMenus.create(
//         {
//             id,
//             title: 'JCReader will investigate your selection',
//             contexts:["all"],
//         }
//     );
// }
//
// chrome.management.getAll(infos => {
//     infos.forEach(info => {
//         if (info.name === 'Splash' && info.version === '1.4.4') {
//             // _myId = info.id;
//             createContextMenu(info.id)
//         }
//     })
// })
