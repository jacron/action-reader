import {handleFormClickActions, handleFormKeydown, showExisting, showNew} from './form.js';
import {initTabs, initSuperTabs, handleTabClickActions} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monacoSettings.js";
import {registerSuggestions} from "./suggestions.js";
import {initDelay} from "./delay.js";
import {handleKeyboardDown} from "./keyboardDown.js";
import {initSwitches} from "./switches.js";

const STORAGE = chrome.storage.local;
const KEY_OPENED_HOST = '_opened_host';
const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';

function initEditors(results, _activeHost) {
    const custom = results[_activeHost];
    if (custom) {
        showExisting();
        initTabs(custom, results[KEY_DEFAULT], results[KEY_DARK]);
        initSuperTabs();
        initSwitches(_activeHost, custom);
    } else {
        showNew();
        document.getElementById('new-host-name').innerText = _activeHost;
    }
    initDelay(_activeHost);
}

function initHost(_activeHost) {
    console.log('*** activeHost=' + _activeHost)
    popup.activeHost = _activeHost;
    document.getElementById('host-name').innerText = _activeHost;
    STORAGE.get([_activeHost, KEY_DEFAULT, KEY_DARK], results => {
        initEditors(results, _activeHost);
    })
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormClickActions();
    handleFormKeydown();
    handleTabClickActions();
    handleKeyboardDown();
    STORAGE.get([KEY_OPENED_HOST], results => {
        initHost(results[KEY_OPENED_HOST]);
    })
    /* require werkt hier dankzij monaco library */
    require.config({ paths: { vs: vsPath}});
    registerSuggestions();
});

export {initHost}
