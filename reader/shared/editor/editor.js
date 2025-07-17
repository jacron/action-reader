/* global require */
/* require is hier mogelijk dankzij de loader van de monaco-editor lib, zie popup.html */

import {editorOptions} from "./editor.options.js";

/**
 * https://github.com/Microsoft/monaco-editor/issues/353
 * Get the alternative version ID of the model.
 * This alternative version ID is not always incremented,
 * it will return the same values about undo-redo.
 * @param model
 * @param doc
 */
function checkDirty(model, doc) {
    setDirty(doc.lastSavedVersion !== model.getAlternativeVersionId(),
        doc);
}

function setDirty(dirty, doc) {
    if (doc.header) {  // set in immersive.js
        const header = document.getElementById(doc.header.id);
        header.innerText = dirty? doc.header.text + '*' : doc.header.text;
    } else {  // from popup.js, using tabs
        const name = doc.name;
        const tabs = document.getElementById('tabs');
        tabs.querySelector('.' + name).innerText =
            dirty ? name + '*' : name;
    }
}

function _initEditor(doc, editorElement) {
    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editorElement, editorOptions(doc));
        doc.editor.focus();
        const model = doc.editor.getModel();
        doc.lastSavedVersion = model.getAlternativeVersionId();
        model.onDidChangeContent(() => checkDirty(model, doc))
    });
}

export {_initEditor}
