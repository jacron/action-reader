import {handleFormEvents, showExisting, showHostActive, showNew} from './form.js';
import {initTabs, initSuperTabs, handleTabClickActions} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monacoSettings.js";
import {registerSuggestions} from "../shared/suggestions.js";
import {initDelay} from "./delay.js";
import {handleKeyboardDown} from "./keyboardDown.js";
import {initSwitches} from "./switches.js";
import {parseMacroInStyle} from "../shared/parse/macro.js";
import {hasDirtyTab} from "./editor.js";

const STORAGE = chrome.storage.local;
const KEY_OPENED_HOST = '_opened_host';
const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';

function initEditors(results, _activeHost) {
    const custom = results[_activeHost];
    if (custom) {
        showExisting();
        const hostName = document.getElementById('host-name');
        const checkBox = document.getElementById('active-host');
        hostName.innerText = _activeHost;
        if (custom.active === 'on') {
            checkBox.checked = true;
            showHostActive(true);
        } else {
            checkBox.checked = false;
            showHostActive(false);
        }
        initTabs(custom, results[KEY_DEFAULT], results[KEY_DARK]);
        initSuperTabs();
        initSwitches(_activeHost, custom);
    } else {
        showNew();
        document.getElementById('new-host-name').innerText = _activeHost;
        document.getElementById('active-host').checked = 'on';
    }
    initDelay(_activeHost);
}

function initHost(_activeHost) {
    console.log('*** activeHost=' + _activeHost)
    popup.activeHost = _activeHost;
    STORAGE.get([_activeHost, KEY_DEFAULT, KEY_DARK], results => {
        initEditors(results, _activeHost);
    })
}

function handleWindowClose() {
    window.onbeforeunload = function(e) {
        if (hasDirtyTab()) {
            e.returnValue = "wat is dat nou?";
        }
    }
}

function commandListener(command) {
    if (command === 'close-editors') {
        window.close()
    }
}

function messageListener(req, sender, sendResponse) {
    console.log(req.message)
    if (req.message === 'close-editors') {
        window.close();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormEvents();
    handleTabClickActions();
    handleKeyboardDown();
    chrome.storage.session.get([KEY_OPENED_HOST], results => {
        initHost(results[KEY_OPENED_HOST]);
    })
    /* require werkt hier dankzij monaco library */
    require.config({ paths: { vs: vsPath}});
    registerSuggestions();
    parseMacroInStyle();
    handleWindowClose();
    chrome.commands.onCommand.addListener(commandListener);
    chrome.runtime.onMessage.addListener(messageListener);
});

export {initHost}
