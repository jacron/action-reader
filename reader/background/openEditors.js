import {getJcReaderHost} from "../lib/util.js";
import {messageToContent} from "../shared/popuplib.js";

const KEY_OPENED_HOST = '_opened_host';

function openEditors() {
    chrome.tabs.query({active: true}, ([tab]) => {
        const hostName = getJcReaderHost(tab.url);
        chrome.sidePanel.open({tabId: tab.id}).then(() => {
            chrome.storage.local
                .set({[KEY_OPENED_HOST]: hostName}).then();
        });
    })
}

function closeEditors() {
    console.log('close editors...?')
    chrome.tabs.query({active: true}, ([tab]) => {
            console.log(tab.url);
            chrome.tabs.sendMessage(tab.id, {
                message: 'closeEditors'
            })
                .then()
                .catch(err => console.error(err.message))
            ;
        }
    )
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
