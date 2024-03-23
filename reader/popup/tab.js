import {monacoDocuments, dynClass, vsPath} from '../shared/constants.js';
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
    const name = doc.name;
    const tabs = document.getElementById('tabs');

    tabs.querySelector('.' + name).innerText =
        dirty ? name + '*' : name;
}

/**
 * https://github.com/Microsoft/monaco-editor/issues/353
 * Get the alternative version id of the model.
 * This alternative version id is not always incremented,
 * it will return the same values in the case of undo-redo.
 * @param model
 * @param doc
 */
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
    const editor = editorElement.querySelector('.the-editor');
    const description = editorElement.querySelector('.description');
    description.innerText = doc.description.replace('@site', popup.activeHost);
    if (doc.tooltip) {
        description.setAttribute('title', doc.tooltip);
    }

    /* require is hier mogelijk dankzij de loader van de monaco-editor lib, zie popup.html */
    require.config({ paths: {
            'vs': vsPath,
        }});
    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editor, {
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
    popup.activeDoc = doc;
    if (doc.editor === null) {
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

function toggle(tabs, mode) {
    const displayValue = mode === 'on' ? 'inline-block' : 'none';
    for (const tab of tabs) {
        document.querySelector('#tabs .' + tab).style.display = displayValue;
    }
}

function toggleCustom(mode) {
    toggle(['default', 'dark', 'selector'], mode)
}

function toggleGeneral(mode) {
    toggle(['_default', '_dark'], mode);
}

function selectSuperTab(tab) {
    const supertabs = document.getElementById('super-tabs');
    removeSelected(supertabs);
    supertabs.querySelector('.' + tab).classList.add(dynClass.SELECTED.className);
    if (tab === 'custom') {
        toggleCustom('on');
        toggleGeneral('off');
        selectTab('default');
    } else {
        toggleCustom('off');
        toggleGeneral('on');
        selectTab('_default');
    }
}

function tabsClickHandler(e) {
    const target = e.target;
    const tabs = ['default', 'dark', 'selector', '_default', '_dark'];
    for (const tab of tabs) {
        if (~target.classList.value.indexOf(tab)) {
            selectTab(tab);
        }
    }
}

function superTabsClickHandler(e) {
    const target = e.target;
    const tabs = ['custom', 'general'];
    for (const tab of tabs) {
        if (~target.classList.value.indexOf(tab)) {
            selectSuperTab(tab);
        }
    }
}

function initTabs(req) {
    const {custom, darkText, defaultText} = req;
    monacoDocuments.default.text = custom.default;
    monacoDocuments.dark.text = custom.dark;
    monacoDocuments.selector.text = custom.selector;
    monacoDocuments._default.text = defaultText;
    monacoDocuments._dark.text = darkText;
    selectTab('default');
}

function initSuperTabs() {
    selectSuperTab('custom');
}

export {superTabsClickHandler, tabsClickHandler, selectTab, setDirty,
    initTabs, initSuperTabs}
