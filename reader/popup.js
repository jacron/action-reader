import {background} from "./background/backgroundState.js";
import {toggleDarkSettings, toggleGeneralSettings} from "./shared/popuplib.js";
import {createWin} from "./background/openEditors.js";

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
            close();
        })
    })
}

function closeWin() {
    chrome.windows.remove(background.winId);
    background.winId = null;
}

function openWin() {
    if (background.winId === null) {
        _openWin();
        return;
    }
    console.log(background.winId)
    isWindowExistent(background.winId).then(r => {
        console.log(r)
        if (!r) _openWin();
        else closeWin();
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

export {_openWin}
