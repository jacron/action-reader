import {sendMessage} from '../shared/constants.js';
import {dynClass, monacoDocuments} from "../shared/constants.js";
import {setEditor} from "./tab.js";

let _activeDoc;
let _activeHost;

function closeMe() {
    sendMessage({request: 'closePopup'});
}

function initJcReader() {
    sendMessage({request: 'getInitial'},
        response => {
            // console.log('initial data', response);
            _activeHost = response.activeHost;
            sendMessage({
                request: 'fetchHost',
                host: _activeHost}, () => { });
        });
}

function postNew() {
    console.log('activeHost', _activeHost);
    sendMessage({
        request: 'storeHost',
        host: _activeHost
    }, () => {
        initJcReader();
    });
}

function deleteReader() {
    if (confirm(`'${_activeHost}' verwijderen?`)) {
        sendMessage({request: 'deleteHost', host: _activeHost },
            () => toggleForms(false));
    }
}

function updateDocument(doc) {
    doc.text = doc.editor.getValue();
}

function save() {
    /** saveHost active document */
    updateDocument(_activeDoc);
    console.log('activeDoc', _activeDoc);
    sendMessage({
        request: 'saveHost',
        name: _activeDoc.name,
        text: _activeDoc.text,
        styleId: _activeDoc.styleId,
        host: _activeHost,
    }, () => {
        // console.log(response)
        _activeDoc.editor.focus();
    });
}

function apply() {
    updateDocument(_activeDoc);
    console.log('activeDoc', _activeDoc);
    sendMessage({
            request: 'applyHost',
            name: _activeDoc.name,
            text: _activeDoc.text,
            host: _activeHost,
            styleId: _activeDoc.styleId,
        },
        () => {
            // console.log(response)
            _activeDoc.editor.focus();
        });
}

function toggleGeneralSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleGeneral',
            host: _activeHost,
            mode});
    })
}

function toggle(classList, set) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        set('off');
    } else {
        classList.remove('off');
        classList.add('on');
        set('on');
    }
}

function toggleDarkSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleDark',
            host: _activeHost,
            mode});
    })
}

function setActiveDoc(activeDoc) {
    _activeDoc = activeDoc;
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

function show(req) {
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
    }
}

export {setFormActions, setActiveDoc, show}
