import {background} from "./backgroundState.js";
import {withActiveTab} from "../shared/activeTab.js";
import {getJcReaderHost} from "../lib/util.js";
import {messageToContent} from "../shared/popuplib.js";

const KEY_OPENED_HOST = '_opened_host';

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
    if (!background.winId) {
        withActiveTab().then(tab => {
            chrome.windows.get(tab.windowId, curWin => {
                chrome.storage.local
                    .set({[KEY_OPENED_HOST]: getJcReaderHost(tab.url)}).then();
                createWin(curWin);
            })
        })
    } else {
        chrome.windows.remove(background.winId).then().catch(() => {console.log('no window with id')});
        background.winId = null;
        background.tTabId = null;
    }
}

function closeEditors() {
    if (background.winId) {
        chrome.windows.remove(background.winId).then();
        background.winId = null;
        background.tTabId = null;
    }
}

function commandListener(command) {
    switch(command) {
        case 'open-editors':
            openEditors();
            break;
        case 'close-editors':
            closeEditors();
            break;
        case 'toggle-reader':
            messageToContent({message: 'toggleReader'})
            break;
        case 'toggle-dark':
            messageToContent({message: 'toggleDark'})
            break;
    }
}

export {openEditors, commandListener}
