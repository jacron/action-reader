import {setDirty} from "./tab.js";
import {popup} from "./popupState.js";
import {toggleDarkSettings, toggleGeneralSettings} from "../shared/popuplib.js";

function closeMe() {
    close();
    // chrome.runtime.sendMessage({request: 'closePopup'});
}

function postNew() {
    console.log('activeHost', popup.activeHost);
    chrome.runtime.sendMessage({
        request: 'storeHost',
        host: popup.activeHost
    }, () => {
        chrome.runtime.sendMessage({
            request: 'initHost',
            client: 'popup'
        }, () => { });
    });
}

function deleteReader() {
    if (confirm(`'${popup.activeHost}' verwijderen?`)) {
        chrome.runtime.sendMessage({request: 'deleteHost', host: popup.activeHost },
            () => formsExistingOrNew(false));
    }
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

function setFormActions() {
    const clickBindings = [
        ['new-answer-no', closeMe],
        ['new-answer-yes', postNew],
        ['reader-delete', deleteReader],
        ['cmd-save', save],
        ['cmd-apply', apply],
        ['general-toggle-switch', toggleGeneralSettings],
        ['dark-toggle-switch', toggleDarkSettings],
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

export {setFormActions, formsExistingOrNew}
