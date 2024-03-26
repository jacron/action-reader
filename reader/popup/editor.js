import {monacoDocuments, vsPath} from "../shared/monaco.js";
import {popup} from "./popupState.js";
import {StorageArea} from "../background/backgroundState.js";

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

const KEY_CLASSES = "hostClasses";

function getCurrentHostClasses() {
    return new Promise(resolve => {
        StorageArea.get([KEY_CLASSES], results => {
            resolve(results[KEY_CLASSES]);
        })
    })
}

function hostClassNames(hostClasses) {
    return hostClasses.map(className => {
        const name = '.' + className
        return {
            label: name,
            insertText: name
        }
    })
}

function _initEditor(doc, hostClasses, editor) {
    console.log('*** classes from Host')
    console.log(hostClasses)
    const suggestions = hostClassNames(hostClasses);

    /* require is hier mogelijk dankzij de loader van de monaco-editor lib, zie popup.html */
    require.config({ paths: {
            'vs': vsPath,
        }});
    require(['vs/editor/editor.main'], () => {
        monaco.languages.registerCompletionItemProvider(doc.language, {
            provideCompletionItems: function(model, position) {
                return {
                    incomplete: false,
                    suggestions
                }
            },
            // triggerCharacters: ['.']
        });
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
    getCurrentHostClasses().then(classes => {
        _initEditor(doc, classes, editor);
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

export {setEditor, setDirty}
