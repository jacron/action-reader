import {setDirty} from "./editor.js";
import {popup} from "./popupState.js";
import {toggleDarkSettings, toggleGeneralSettings} from "../shared/popuplib.js";
import {getCurrentHost} from "../background/host.js";

function closeMe() {
    close();
}

function postNew() {
    console.log('activeHost', popup.activeHost);
    chrome.runtime.sendMessage({
        request: 'newHost',
        host: popup.activeHost
    }, () => {
        chrome.runtime.sendMessage({
            request: 'initHost',
            client: 'popup'
        }, () => { });
    });
}

function updateDocument(doc) {
    doc.text = doc.editor.getValue();
}

function save() {
    /** saveHost active document, handled in actions */
    updateDocument(popup.activeDoc);
    chrome.runtime.sendMessage({
        request: 'saveHost',
        name: popup.activeDoc.name,
        text: popup.activeDoc.text,
        styleId: popup.activeDoc.styleId,
        host: popup.activeHost,
    }, () => {
        popup.activeDoc.editor.focus();
        popup.activeDoc.lastSavedVersion =
            popup.activeDoc.editor
                .getModel()
                .getAlternativeVersionId();
        setDirty(false, popup.activeDoc);
    });
}

function apply() {
    updateDocument(popup.activeDoc);
    console.log('activeDoc', popup.activeDoc);
    chrome.runtime.sendMessage({
            request: 'applyHost',
            name: popup.activeDoc.name,
            text: popup.activeDoc.text,
            host: popup.activeHost,
            styleId: popup.activeDoc.styleId,
        },
        () => {
            popup.activeDoc.editor.focus();
            setDirty(false, popup.activeDoc);
        });
}

function formsExistingOrNew(hostExists) {
    const existing = document.getElementById('existing-reader-dialog');
    const newview = document.getElementById('new-reader-dialog');
    const generalControls = document.querySelector('.general-controls');
    if (hostExists) {
        existing.style.display = 'block';
        newview.style.display = 'none';
        generalControls.style.display = 'block';
    } else {
        existing.style.display = 'none';
        newview.style.display = 'block';
        generalControls.style.display = 'none';
    }
}

function replace() {
    popup.activeDoc.editor.getAction('editor.action.startFindReplaceAction').run().then();
    console.log(popup.activeDoc.editor.getSupportedActions());
}

function handleFormClickActions() {
    const clickBindings = [
        ['new-answer-no', closeMe],
        ['new-answer-yes', postNew],
        ['cmd-save', save],
        ['cmd-apply', apply],
        ['general-toggle-switch', toggleGeneralSettings],
        ['dark-toggle-switch', toggleDarkSettings],
        ['cmd-replace', replace],
    ];
    for (const binding of clickBindings) {
        const [id, func] = binding;
        const element = document.getElementById(id);
        if (!element) {
            console.error('no element found with id:', id);
        }
        element.addEventListener('click', func);
    }
}

function handleFormKeydown() {
    const inputDelay = document.getElementById('editor-input-delay');
    inputDelay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            console.log(inputDelay.value);
            getCurrentHost().then(host => host.store({delay: inputDelay.value}));
        }
    })
}

export {handleFormClickActions, handleFormKeydown, formsExistingOrNew, save, apply}
