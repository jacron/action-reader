import {background} from "./background/backgroundState.js";
import {toggleDarkSettings, toggleGeneralSettings} from "./shared/popuplib.js";

let openedWinId = -1;

function createWin(curWin) {
    chrome.windows.create({
        url: 'popup/popup.html',
        type: 'popup',
        width: 500,
        height: curWin.height,
        top: curWin.top,
        left: curWin.left - 500
    }, win => {
        openedWinId = win.id;
        background.winId = win.id;
        background.tTabId = win.tabs[0].id;
    })
}

function isWindowExistent(windowId) {
    return new Promise((resolve, reject) => {
        chrome.windows.get(windowId, (window) => {
            if (chrome.runtime.lastError) {
                // Window not found, likely doesn't exist
                resolve(false);
            } else {
                // Window found, it exists
                resolve(true);
            }
        });
    });
}

function _openWin() {
    chrome.tabs.query({
        active: true
    }, tabs => {
        chrome.windows.get(tabs[0].windowId, curWin => {
            createWin(curWin);
        })
    })
}

function openWin() {
    if (openedWinId === -1) {
        _openWin();
        return;
    }
    isWindowExistent(openedWinId).then(r => {
        if (!r) _openWin();
    })
}

function handleCmds() {
    document.getElementById('cmdOpenEditors').addEventListener('click', openWin);
    document.getElementById('general-toggle-switch').addEventListener('click',
            e => toggleGeneralSettings(e));
    document.getElementById('dark-toggle').addEventListener('click',
        e => toggleDarkSettings(e));
}

handleCmds();
