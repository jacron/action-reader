import {app} from "./state.js";
import {getJcReaderHost} from "./util.js";

function openView() {
    chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: 500,
        height: 500,
        top: 20,
    }, win => {
        app.winId = win.id;
        app.tTabId = win.tabs[0].id;
    })
}

function closeView() {
    if (app.winId) {
        chrome.windows.remove(app.winId, () => {
            app.winId = null
        });
    }
}

function initView() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        if (tabs[0]) {
            app.activeUrl = tabs[0].url;
            app.tabId = tabs[0].id;
            app.activeHost = getJcReaderHost(app.activeUrl);
            openView();
        }
    });
}

export { initView, closeView }
