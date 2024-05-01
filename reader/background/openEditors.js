import {getJcReaderHost} from "../lib/util.js";
import {messageToContent} from "../shared/popuplib.js";
import {background} from "./backgroundState.js";

function openEditors() {
    chrome.tabs.query({active: true}, ([tab]) => {
        background.tTabId = tab.id;
        background.activeHost = getJcReaderHost(tab.url);
        chrome.sidePanel.open({tabId: tab.id}).then();
    })
}

function closeEditors() {
    chrome.runtime.sendMessage({message: 'close-editors'}).then()
        .catch(err => console.error(err.message))

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
