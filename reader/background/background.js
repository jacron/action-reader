import {updateBadge} from "./badge.js";
import {messageToContent} from "../shared/popuplib.js";
import {closeEditors, openEditors} from "./openEditors.js";
import {background} from "./backgroundState.js";

function activateListener(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, activeTab => {
        if (activeTab) {
            updateBadge(activeTab.url)
        }
    });
}

function updateListener(_tabId, info) {
    if (info.status === 'loading' || info.status === 'complete') {
        updateBadge(info.url);
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

function windowRemoved(winId) {
    if (background.winId === winId) {
        background.winId = null;
    }
}

chrome.tabs.onUpdated.addListener(updateListener);
chrome.tabs.onActivated.addListener(activateListener);
chrome.commands.onCommand.addListener(commandListener);
chrome.windows.onRemoved.addListener(windowRemoved);
