import {monacoDocuments, vsPath} from "../../shared/monacoSettings.js";
import {_initEditor} from "../../shared/editor/editor.js";

const keysGeneral = [
    '_default',
    '_dark'
]

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
