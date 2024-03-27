import {monacoDocuments} from "../shared/monacoSettings.js";
import {popup} from "./popupState.js";

function hideEditors() {
    for (const entry of Object.entries(monacoDocuments)) {
        document.getElementById(entry[1].id).style.visibility = 'hidden';
    }
}

function showEditor(doc) {
    hideEditors();
    document.getElementById(doc.id).style.visibility = 'visible';
    if (doc.editor) {
        doc.editor.focus();
    }
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

function editorOptions(doc) {
    return {
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
    };
}

function _initEditor(doc, editorElement) {
    /* require is hier mogelijk dankzij de loader van de monaco-editor lib, zie popup.html */

    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editorElement, editorOptions(doc));
        doc.editor.focus();
        const model = doc.editor.getModel();
        doc.lastSavedVersion = model.getAlternativeVersionId();
        model.onDidChangeContent(() => checkDirty(model, doc))
    });
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
    editorElementContainer.style.visibility = 'visible';
    _initEditor(doc, editorElement);
}

function setEditor(doc) {
    popup.activeDoc = doc;
    if (doc.editor === null) {
        initEditor(doc);
    } else {
        showEditor(doc);
    }
}

function insertText(text) {
    const editor = popup.activeDoc.editor;
    if (editor) {
        editor.trigger('keyboard', 'type', {text});
    } else {
        console.log('*** editor NOT defined')
    }
}

export {setEditor, setDirty, insertText}
