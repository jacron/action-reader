import {background} from "./backgroundState.js";
import {getJcReaderHost} from "./util.js";

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

function initView() {
    // openView();
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        if (tabs[0]) {
            const {url, id} = tabs[0];
            // console.log('active id', id);
            background.activeUrl = url;
            background.tabId = id;
            background.activeHost = getJcReaderHost(url);
            openView();
            // showBadge();
        }
    });
}

export { initView, closeView }
