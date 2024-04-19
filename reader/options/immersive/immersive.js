import {monacoDocuments, vsPath} from "../../shared/monacoSettings.js";
import {editorOptions} from "../../popup/editor.js";

const keysGeneral = [
    '_default',
    '_dark'
]

function setDirty(dirty, doc) {
    const header = document.getElementById(doc.header.id);
    header.innerText = dirty? doc.header.text + '*' : doc.header.text;
}

function checkDirty(model, doc) {
    setDirty(doc.lastSavedVersion !== model.getAlternativeVersionId(),
        doc);
}

function _initEditor(doc, editorElement) {
    /* require is hier moge lijk dankzij de loader van de monaco-editor lib, zie popup.html */
    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editorElement, editorOptions(doc));
        doc.editor.focus();
        const model = doc.editor.getModel();
        doc.lastSavedVersion = model.getAlternativeVersionId();
        model.onDidChangeContent(() => checkDirty(model, doc))
    });
}

function getTheEditorElement(containerId) {
    const editorElementContainer = document.getElementById(containerId);
    return editorElementContainer.querySelector('.the-editor');
}

function initEditor(doc, containerId) {
    _initEditor(doc, getTheEditorElement(containerId));
}

function init() {
    /* require (2x) werkt hier dankzij monaco library */
    require.config({ paths: {
            'vs': '../' + vsPath,
        }});
    chrome.storage.local.get(keysGeneral, results => {
        // console.log(results[keysGeneral[0]])
        const [_default, _dark] = keysGeneral;
        const docReader = monacoDocuments[_default];
        const docDark = monacoDocuments[_dark];
        docReader.text = results[_default];
        docDark.text = results[_dark];
        docReader.header = {
            id: 'reader-header',
            text: 'reader'
        }
        docDark.header = {
            id: 'dark-header',
            text: 'dark'
        }
        initEditor(docReader, 'editor-reader');
        initEditor(docDark, 'editor-dark');
    })
}

init();
