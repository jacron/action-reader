import {setDirty} from "./editor.js";
import {popup} from "./popupState.js";
import {getCurrentHost, setHostFieldValue} from "../background/host.js";
import {initHost} from "./popup.js";
import {StorageArea} from "../shared/constants.js";
import {applyHost, saveHost} from "./saveHost.js";
import {insertText} from "../shared/parse/macro.js";

function closeMe() {
    close();
}

function getMonacoModel(editor) {
    /** @type {monaco.editor.ITextModel} */
    return editor.getModel();
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
    const model = getMonacoModel(popup.activeDoc.editor);
    popup.activeDoc.lastSavedVersion = model.getAlternativeVersionId();
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

function handleFormKeydown() {
    const inputDelay = document.getElementById('editor-input-delay');
    inputDelay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            console.log(inputDelay.value);
            getCurrentHost().then(host => {
                setHostFieldValue(host, 'delay', inputDelay.value);
                showSavedDelayMsg();
            });
        }
    })
}

function getSelectedText() {
    const editor = popup.activeDoc.editor;
    const selection = editor.getSelection();
    return getMonacoModel(editor).getValueInRange(selection);
}

function handleMetaKeyDown(key) {
    if (key === 'v') {
        navigator.clipboard.readText().then(text => {
            insertText(text);
        })
    }
    if (key === 'c') {
        const selectedText = getSelectedText();
        navigator.clipboard.writeText(selectedText).then();
    }
    if (key === 'x') {
        const selectedText = getSelectedText();
        navigator.clipboard.writeText(selectedText).then();
        const editor = popup.activeDoc.editor;
        editor.trigger(monaco.KeyCode.Delete, 'deleteLeft');
    }
}

function handleMacroKeys() {
    document.addEventListener('keydown', (e) => {
        const buttons = document.querySelectorAll('#macros button');
        if (e.ctrlKey) {
            for (const button of buttons) {
                if (button.getAttribute('data-key') === e.key) {
                    button.click();
                }
            }
        }
        if (e.metaKey) {
            handleMetaKeyDown(e.key);
        }
    })
}

function showHostActive(on) {
    const hostName = document.getElementById('host-name');
    if (on) {
        hostName.classList.remove('non-active');
    } else {
        hostName.classList.add('non-active');
    }
}

function handleActive() {
    const checkBox = document.getElementById('active-host');
    checkBox.addEventListener('change', (e) => {
        setHostFieldValue(popup.activeHost, 'active', e.target.checked ? 'on' : 'off');
        showHostActive(e.target.checked);
        applyHost();
    })
}

function handleFormEvents() {
    handleFormClickActions();
    handleFormKeydown();
    handleMacroKeys();
    handleActive();
}

export {handleFormEvents, showExisting, showNew, save, apply, showHostActive}
