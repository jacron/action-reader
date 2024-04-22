import {monacoDocuments} from "../shared/monacoSettings.js";
import {popup} from "./popupState.js";
import {_initEditor} from "../shared/editor/editor.js";

function hideEditors() {
    for (const entry of Object.entries(monacoDocuments)) {
        const id = entry[1].id;
        document.getElementById(id).style.display = 'none';  //.visibility = 'hidden';
    }
}

function showEditor(doc) {
    document.getElementById(doc.id).style.display = 'block';  //visibility = 'visible';
    if (doc.editor) {
        doc.editor.focus();
    }
}

function hasDirtyTab() {
    for (const tab of document.querySelectorAll('#tabs > div')) {
        if (tab.textContent.indexOf('*') !== -1) {
            return true;
        }
    }
    return false;
}

function setDirty(dirty, doc) {
    const name = doc.name;
    const tabs = document.getElementById('tabs');
    tabs.querySelector('.' + name).innerText =
        dirty ? name + '*' : name;
}

function initEditor(doc) {
    const editorElementContainer = document.getElementById(doc.id);
    if (!editorElementContainer) {
        console.error('no element with id:', doc.id);
        return;
    }
    const editorElement = editorElementContainer.querySelector('.the-editor');
    const descriptionElement = editorElementContainer.querySelector('.description');
    descriptionElement.innerText = doc.description.replace('@site', popup.activeHost);
    editorElementContainer.style.display = 'block';  //.visibility = 'visible';
    _initEditor(doc, editorElement);
}

function setEditor(doc) {
    hideEditors();
    popup.activeDoc = doc;
    if (doc.editor === null) {
        initEditor(doc);
    } else {
        showEditor(doc);
    }
}

export {setEditor, setDirty, hasDirtyTab}
