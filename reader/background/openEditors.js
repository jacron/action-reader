import {getJcReaderHost} from "../lib/util.js";
import {messageToContent} from "../shared/popuplib.js";
import {background} from "./backgroundState.js";
import {withActiveTab} from "../shared/activeTab.js";

const KEY_OPENED_HOST = '_opened_host';

function openEditors() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
        background.tTabId = tab.id;
        background.activeHost = getJcReaderHost(tab.url);
        chrome.storage.session.set({[KEY_OPENED_HOST]: background.activeHost}).then();
        chrome.sidePanel.open({tabId: tab.id}).then();
    })
}

function closeEditors() {
    chrome.runtime.sendMessage({message: 'close-editors'}).then()
        .catch(err => console.log(err.message))
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

export {openEditors, closeEditors, commandListener}
