import {background} from "./backgroundState.js";
import {getJcReaderHost} from "../lib/util.js";

function createWin(curWin) {
    chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: 500,
        height: curWin.height,
        top: curWin.top,
        left: curWin.left - 500
    }, win => {
        background.winId = win.id;
        background.tTabId = win.tabs[0].id;
    })
}

function openView() {
    chrome.windows.getCurrent(curwin => {
        createWin(curwin)
    });
}

function closeView() {
    if (background.winId) {
        chrome.windows.remove(background.winId, () => {
            background.winId = null
        });
    }
}

function queryTab() {
    chrome.tabs.query({
        active: true,
    }, function (tabs) {
        if (tabs.length > 0) {
            let tab = tabs[0];
            for (const  t of tabs) {
                if (t.url.startsWith('http')) {
                    tab = t;
                    break;
                }
            }
            const {url, id} = tab;
            background.activeUrl = url;
            background.tabId = id;
            background.activeHost = getJcReaderHost(url);
            openView();
            // showBadge();
        }
    });
}

function initView() {
    queryTab();
}

export { initView, closeView }
