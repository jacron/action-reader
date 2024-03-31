import {background} from "./backgroundState.js";
import {withActiveTab} from "../shared/activeTab.js";

function createWin(curWin) {
    let left = curWin.left - 500;
    if (left < 0) {
        left = 0;
    }
    chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: 500,
        height: curWin.height,
        top: curWin.top,
        left
    }, win => {
        background.winId = win.id;
        background.tTabId = win.tabs[0].id;
    })
}

function openEditors() {
    withActiveTab().then(tab => {
        chrome.windows.get(tab.windowId, curWin => {
            createWin(curWin);
        })
    })
}

export {openEditors, createWin}
