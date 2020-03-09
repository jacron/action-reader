import {setActiveDoc} from "./form.js";
import {monacoDocuments, dynClass} from '../shared/constants.js';
import {popup} from "./popupState.js";

function hideEditors() {
    for (const entry of Object.entries(monacoDocuments)) {
        document.getElementById(entry[1].id).style.visibility = 'hidden';
    }
}

function showEditor(doc) {
    hideEditors();
    document.getElementById(doc.id).style.visibility = 'visible';
    doc.editor.focus();
}

function setDirty(dirty, doc) {
    // console.log(dirty);

    const name = doc.name;
    // console.log(name);
    const tabs = document.getElementById('tabs');

    tabs.querySelector('.' + name).innerText =
        dirty ? name + '*' : name;

}

function checkDirty(model, doc) {
    setDirty(doc.lastSavedVersion !== model.getAlternativeVersionId(),
        doc);
}

function initEditor(doc) {
    const editorElement = document.getElementById(doc.id);
    if (!editorElement) {
        console.error('no element with id:', doc.id);
        return;
    }
    const vsPath = '../node_modules/monaco-editor/min/vs';

    require.config({ paths: {
            'vs': vsPath,
        }});
    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editorElement, {
            lineNumbers: false,
            value: doc.text,
            language: doc.language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: {
                enabled: false
            },
            parameterHints: {
                enabled: false
            },
            codeLens: false,
            hover: {
                enabled: false
            },
        });
        document.getElementById(doc.id).style.visibility = 'visible';
        doc.editor.focus();
        const model = doc.editor.getModel();
        doc.lastSavedVersion = model.getAlternativeVersionId();
        model.onDidChangeContent(() => checkDirty(model, doc))
    });
}

function setEditor(doc) {
    // activeDoc = doc;;
    setActiveDoc(doc);
    if (doc.editor === null) {
        // console.log('init editor');
        initEditor(doc);
    } else {
        showEditor(doc);
    }
}

function removeSelected(tabs) {
    const selectedTabs = tabs.querySelectorAll(dynClass.SELECTED.selector);

    for (let i = 0; i < selectedTabs.length; i++) {
        selectedTabs[i].classList.remove(dynClass.SELECTED.className);
    }

}

function selectTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = monacoDocuments[tab];

    removeSelected(tabs);
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
    setEditor(doc);
}

function setTabActions() {
    const tabs = document.getElementById('tabs');
    tabs.addEventListener('click', e => {
        const target = e.target;
        const tabs = ['css', 'selector', 'default', 'dark'];
        for (const tab of tabs) {
            if (~target.classList.value.indexOf(tab)) {
                selectTab(tab);
            }
        }
    });
}

export {setTabActions, setEditor, setDirty}
