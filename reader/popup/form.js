import {sendMessage} from '../shared/constants.js';
import {dynClass, monacoDocuments} from "../shared/constants.js";
import {setEditor, setDirty} from "./tab.js";
import {popup} from "./popupState.js";

// let popup.activeDoc;
// let popup.activeHost;



function closeMe() {
    sendMessage({request: 'closePopup'});
}

function initJcReader() {
    sendMessage({request: 'getInitial'},
        response => {
            popup.activeHost = response.activeHost;
            sendMessage({
                request: 'fetchHost',
                host: popup.activeHost}, () => { });
        });
}

function postNew() {
    console.log('activeHost', popup.activeHost);
    sendMessage({
        request: 'storeHost',
        host: popup.activeHost
    }, () => {
        initJcReader();
    });
}

function deleteReader() {
    if (confirm(`'${popup.activeHost}' verwijderen?`)) {
        sendMessage({request: 'deleteHost', host: popup.activeHost },
            () => toggleForms(false));
    }
}

function updateDocument(doc) {
    doc.text = doc.editor.getValue();
}

function save() {
    /** saveHost active document */
    updateDocument(popup.activeDoc);
    // console.log('activeDoc', popup.activeDoc);
    sendMessage({
        request: 'saveHost',
        name: popup.activeDoc.name,
        text: popup.activeDoc.text,
        styleId: popup.activeDoc.styleId,
        host: popup.activeHost,
    }, () => {
        // console.log(response)
        popup.activeDoc.editor.focus();
        popup.activeDoc.lastSavedVersion =
            popup.activeDoc.editor.getModel().getAlternativeVersionId();
        setDirty(false, popup.activeDoc);
    });
}

function apply() {
    updateDocument(popup.activeDoc);
    console.log('activeDoc', popup.activeDoc);
    sendMessage({
            request: 'applyHost',
            name: popup.activeDoc.name,
            text: popup.activeDoc.text,
            host: popup.activeHost,
            styleId: popup.activeDoc.styleId,
        },
        () => {
            // console.log(response)
            popup.activeDoc.editor.focus();
            setDirty(false, popup.activeDoc);
        });
}

function toggle(classList, cb) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        cb('off');
    } else {
        classList.remove('off');
        classList.add('on');
        cb('on');
    }
}

function toggleGeneralSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleGeneral',
            host: popup.activeHost,
            mode});
    })
}

function toggleActive(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleActive',
            host: popup.activeHost,
            mode});
    });
}

function toggleDarkSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleDark',
            host: popup.activeHost,
            mode
        });
    })
}

function setActiveDoc(activeDoc) {
    popup.activeDoc = activeDoc;
}

function toggleForms(hostExists) {
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
        ['active-toggle-switch', toggleActive]
    ];
    for (const binding of clickBindings) {
        const [id, fun] = binding;
        const element = document.getElementById(id);
        if (!element) {
            console.error('no element found with id:', id);
        }
        element.addEventListener(
            'click', fun);
    }
    initJcReader();
}

function initTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = monacoDocuments[tab];
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
}

function setActive(mode) {
    const switchActive = document.getElementById('active-toggle-switch');
    if (mode === 'off') {
        switchActive.classList.remove('on');
        switchActive.classList.add('off');
    }
}

function show(req) {
    // console.log('req', req);
    const {host, result, darkText, defaultText} = req;
    const custom = result[host];
    toggleForms(custom);
    if (custom) {
        initTab('css');
        monacoDocuments.css.text = custom.css;
        monacoDocuments.selector.text = custom.selector;
        monacoDocuments.default.text = defaultText;
        monacoDocuments.dark.text = darkText;
        // console.log('documents', monacoDocuments);
        setEditor(monacoDocuments.css);
        setActive(custom.active);
    }
}

export {setFormActions, setActiveDoc, show}
