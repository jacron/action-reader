import {setDirty} from "./editor.js";
import {popup} from "./popupState.js";
import {Host} from "../background/host.js";
import {initHost} from "./popup.js";
import {StorageArea} from "../background/backgroundState.js";
import {applyHost, saveHost} from "./saveHost.js";

const KEY_HOSTNAME = 'hostname';

function closeMe() {
    close();
}

function postNew() {
    console.log('activeHost', popup.activeHost);
    StorageArea.set({[popup.activeHost]: {}}, () => {
        initHost(popup.activeHost);
    });
}

function updateDocument() {
    const doc = popup.activeDoc
    doc.text = doc.editor.getValue();
}

function save() {
    updateDocument();
    saveHost();
    popup.activeDoc.editor.focus();
    popup.activeDoc.lastSavedVersion =
        popup.activeDoc.editor
            .getModel()
            .getAlternativeVersionId();
    setDirty(false, popup.activeDoc);
}

function apply() {
    console.log('activeDoc', popup.activeDoc);
    updateDocument();
    applyHost();
    popup.activeDoc.editor.focus();
    setDirty(false, popup.activeDoc);
}

function showElement(elementId, visible) {
    if (!document.getElementById(elementId)) {
        console.log('*** id not exists:' + elementId)
    }
    document.getElementById(elementId).style.display = visible ? 'block' : 'none';
}

function showExisting() {
    showElement('existing-reader-dialog', true);
    showElement('new-reader-dialog', false);
    showElement('general-controls', true);
}

function showNew() {
    showElement('existing-reader-dialog', false);
    showElement('new-reader-dialog', true);
    showElement('general-controls', false);
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

function showSavedDelayMsg () {
    const msg = document.getElementById('delay-saved-msg');
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none';
    }, 5000)
}

function getCurrentHost() {
    return new Promise((resolve, reject) => {
        StorageArea.get([KEY_HOSTNAME], results => {
            if (results) {
                resolve(new Host(results[KEY_HOSTNAME]));
            } else reject();
        })
    })
}

function handleFormKeydown() {
    const inputDelay = document.getElementById('editor-input-delay');
    inputDelay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            console.log(inputDelay.value);
            getCurrentHost().then(host => {
                host.store({delay: inputDelay.value});
                showSavedDelayMsg();
            });
        }
    })
    document.addEventListener('keydown', (e) => {
        const buttons = document.querySelectorAll('#macros button');
        // console.log(e)
        if (e.ctrlKey) {
            for (const button of buttons) {
                if (button.getAttribute('data-key') === e.key) {
                    button.click();
                }
            }
        }
    })
}

export {handleFormClickActions, handleFormKeydown, showExisting, showNew, save, apply}
