import {background} from "./background/backgroundState.js";

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

function handleCmds() {
    document.getElementById('cmdOpenEditors').addEventListener('click', () => {
        chrome.tabs.query({
            active: true
        }, tabs => {
            chrome.windows.get(tabs[0].windowId, curWin => {
                createWin(curWin);
            })
        })
    })
}

handleCmds();
