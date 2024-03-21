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

function openWin() {
    chrome.tabs.query({
        active: true
    }, tabs => {
        chrome.windows.get(tabs[0].windowId, curWin => {
            createWin(curWin);
        })
    })
}

function toggle(classList, cb) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        cb('off');
    } else {
        classList.remove('off');
        classList.add('on');
        cb('on');
    }
}

function turnOnDarkModeSwitch() {
    const classList = document.getElementById('dark-toggle-switch').classList;
    classList.remove('off');
    classList.add('on');
}

function toggleGeneralSettings(e) {
    toggle(e.target.classList, mode => {
        const message = {
            message: 'toggleGeneralContent',
            mode};
        chrome.tabs.query({
            active: true
        }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, message);
        })
    })
}

function toggleDarkSettings(e) {
    toggle(e.target.classList, mode => {
        const message = {
            message: 'toggleDarkContent',
            mode};
        chrome.tabs.query({
            active: true
        }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, message);
        })
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
