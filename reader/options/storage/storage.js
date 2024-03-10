import {vsPath} from "../../shared/constants.js";
// import {setDirty} from "../../popup/tab";

let sites = null;
let editors = {};

function updateSite(input) {
    const li = input.parentElement;
    const name = li.querySelector('span').innerText.trim();
    for (const [key, value] of Object.entries(sites)) {
        if (key === name) {
            value.active = input.checked ? 'on' : 'off';
            break;
        }
    }
}

function makeCheckbox(value) {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    if (value.active === 'on') {
        input.setAttribute('checked', 'checked');
    }
    input.addEventListener('change', e => {
        if (sites) {
            updateSite(e.target);
            chrome.storage.local.set(sites, () => console.log('options updated.'));
        }
    })
    return input;
}

function makeAnchor(name) {
    const anchor = document.createElement('a');
    anchor.innerText = ' ' + name;
    anchor.setAttribute('href', 'https://' + name)
    return anchor;
}

function checkDirty(model, doc) {
    // setDirty(doc.lastSavedVersion !== model.getAlternativeVersionId(),
    //     doc);
}

function createEditor(name, value, language, editorId) {
    document.getElementById('site-name').innerText = name;
    const editor = document.getElementById(editorId);
    return monaco.editor.create(editor, {
        lineNumbers: false,
        value: value,
        language: language,
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
}

function adaptEditor(editor, value) {
    editor.setValue(value);
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, '');
}

function showEditors(name, value) {
    // console.log(value);
    if (editors.selector) {
        adaptEditor(editors.selector, value.selector);
    } else {
        editors.selector = createEditor(name, value.selector, '', 'editor-selector');
    }
    if (editors.default) {
        adaptEditor(editors.default, value.default);
    } else {
        editors.default = createEditor(name, value.default, 'scss', 'editor-default');
    }
    if (editors.dark) {
        adaptEditor(editors.dark, value.dark);
    } else {
        editors.dark = createEditor(name, value.dark, 'scss', 'editor-dark');
    }
}

function makeEditButton(name, value) {
    const button = document.createElement('button');
    button.innerText = 'show';
    button.addEventListener('click', () => {
        showEditors(name, value);
    })
    return button;
}

function siteLi(name, value) {
    const li = document.createElement('li');
    li.appendChild(makeCheckbox(value));
    li.appendChild(makeEditButton(name, value));
    li.appendChild(makeAnchor(name));
    return li;
}

function listSites(sites) {
    const sitesList = document.getElementById('sites-list');
    for (const [key, value] of Object.entries(sites)) {
        if (key.length > 0) {
            sitesList.appendChild(siteLi(key, value));
        }
    }
}

function init() {
    require.config({ paths: {
            'vs': '../' + vsPath,
        }});
    require(['vs/editor/editor.main'], () => {});
    chrome.storage.local.get(null, sites1 => {
        listSites(sites1, 'storagelist');
        // console.log(sites1);
        sites = sites1;
    })
}

init();
