import {handleFormClickActions, formsExistingOrNew} from './form.js';
import {tabsClickHandler, superTabsClickHandler, initTabs, initSuperTabs} from './tab.js';
import {popup} from "./popupState.js";
import {vsPath} from "../shared/monaco.js";
import {StorageArea} from "../background/backgroundState.js";

function initHost() {
    chrome.runtime.sendMessage({
        request: 'initHost',
        client: 'popup'}, () => {});
}

function onInitHost(req) {
    popup.activeHost = req.host;
    document.getElementById('host-name').innerText = req.host;
    formsExistingOrNew(req.custom);
    if (req.custom) {
        initTabs(req);
        initSuperTabs();
    } else {
        document.getElementById('new-host-name').innerText = req.host;
    }
}

function messageListener(req, sender, sendResponse) {
    if (req.message === 'onInitHost') {
        onInitHost(req);
        sendResponse('handled');
    } else {
        sendResponse('no request handled');
    }
}

function handleKeyboardDown() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            close();
        }
    })
}

function handleTabClickActions() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

function makeSuggestions(sel) {
    /* mix classes en ids in selectors */
    const selectors = [];
    sel[KEY_CLASSES].map(className => {
        const name = '.' + className;
        selectors.push({
            label: name,
            insertText: name
        })
    })
    sel[KEY_IDS].map(idName => {
        const name = '#' + idName;
        selectors.push({
            label: name,
            insertText: name
        })
    })
    return selectors;
}

const KEY_CLASSES = "hostClasses";
const KEY_IDS = 'hostIds';

function getCurrentHostClasses() {
    return new Promise(resolve => {
        StorageArea.get([KEY_CLASSES, KEY_IDS], results => {
            resolve(results);
        })
    })
}

document.addEventListener('DOMContentLoaded', function () {
    handleFormClickActions();
    handleTabClickActions();
    handleKeyboardDown();
    initHost();
    /* require (2x) werkt hier dankzij monaco library */
    require.config({ paths: {
            vs: vsPath,
        }});
    require(['vs/editor/editor.main'], () => {
        getCurrentHostClasses().then(selectors => {
            const suggestions = makeSuggestions(selectors);
            monaco.languages.registerCompletionItemProvider('css', {
                provideCompletionItems: function(model, position) {
                    return {
                        incomplete: false,
                        suggestions
                    }
                },
            });
        });
    });
});

chrome.runtime.onMessage.addListener(messageListener);

