import {handleFormClickActions, formsExistingOrNew, handleFormKeydown, initSwitches} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monacoSettings.js";
import {registerSuggestions} from "./suggestions.js";
import {Host} from "../background/host.js";
import {initDelay} from "./delay.js";
import {handleKeyboardDown} from "./keyboardDown.js";

const KEY_OPENED_HOST = '_opened_host';

function initHost() {
    chrome.storage.local.get([KEY_OPENED_HOST], results => {
        const _activeHost = results[KEY_OPENED_HOST];
        console.log('*** activeHost=' + _activeHost)
        popup.activeHost = _activeHost;
        document.getElementById('host-name').innerText = _activeHost;
        const host = new Host(_activeHost);
        host.getCustom().then(responseCustom => {
            host.getGeneral().then(responseGeneral => {
                const custom = responseCustom[_activeHost];
                formsExistingOrNew(custom);
                if (custom) {
                    initTabs(custom, responseGeneral);
                    initSuperTabs();
                } else {
                    document.getElementById('new-host-name').innerText = _activeHost;
                }
                initDelay(_activeHost);
            });
        }).catch(err => {
            console.error(err);
        });
    })
}

function handleTabClickActions() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormClickActions();
    handleFormKeydown();
    initSwitches();
    handleTabClickActions();
    handleKeyboardDown();
    initHost();
    /* require werkt hier dankzij monaco library */
    require.config({ paths: {
            vs: vsPath,
        }});
    registerSuggestions();
});
