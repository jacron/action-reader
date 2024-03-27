import  {vsPath} from "../../shared/monacoSettings.js";
import {deleteHost} from "../../background/host.js";

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

function makeAnchor(name, value) {
    const anchor = document.createElement('a');
    anchor.innerText = ' ' + name;
    anchor.addEventListener('click', () => {
        setName(name);
        showEditors(value);
    })

    return anchor;
}

function setName(name) {
    const anchor = document.getElementById('site-name');
    anchor.innerText = name;
    anchor.setAttribute('href', 'https://' + name);
    document.getElementById('delete-site').style.visibility = 'visible';
}

function reSetName(name) {
    const anchor = document.getElementById('site-name');
    anchor.innerText = '';
    document.getElementById('delete-site').style.visibility = 'hidden';
}

function createEditor(value, language, editorId) {
    const monacoOptions = {
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
    };
    return monaco.editor.create(document.getElementById(editorId), monacoOptions);
}

function showToggler() {
    const toggle = document.getElementById('toggle-container');
    toggle.style.display = 'block';
}

function showOneEditor(editor) {
    if (editors[editor.name]) {
        editors[editor.name].setValue(editor.value);
    } else {
        editors[editor.name] = createEditor(editor.value, editor.language, editor.id);
    }
}

function toggleGeneral(showGeneral) {
    const siteEditors = document.getElementById('site-editors');
    const generalEditor = document.getElementById('general-editor');
    if (showGeneral) {
        siteEditors.style.display = 'none';
        generalEditor.style.display = 'block';
    } else {
        siteEditors.style.display = 'block';
        generalEditor.style.display = 'none';
    }
}

function showEditorsSite(value) {
    toggleGeneral(false);
    showOneEditor({ name: "selector", value: value.selector, language: "", id: "editor-selector"},);
    showOneEditor({ name: "default", value: value.default, language: "scss", id: "editor-default" });
    showOneEditor({ name: "dark", value: value.dark, language: "scss", id: "editor-dark" });
}

function showEditorGeneral(value) {
    toggleGeneral(true);
    showOneEditor({name: "general", value, language: "scss", id: "editor-general"});
}

function showEditors(value) {
    showToggler();
    if (value.active) { // value is an object
        showEditorsSite(value);
    } else {  // value is a string
        showEditorGeneral(value);
    }
}

function hideSitesList() {
    const container = document.getElementById('sites-list-container');
    container.style.width = '0px';
    container.style.display = 'none';
    const toggle = document.getElementById('toggle-container');
    toggle.style.display = 'block';
    toggle.innerText  = '>';
}

function showSitesList() {
    const container = document.getElementById('sites-list-container');
    container.style.width = 'max-content';
    container.style.display = 'block';
    const toggle = document.getElementById('toggle-container');
    toggle.innerText  = '<';
}

function initToggle() {
    const toggle = document.getElementById('toggle-container');
    toggle.addEventListener('click', (e) => {
        if (e.target.innerText === '>') {
            showSitesList();
        } else {
            hideSitesList();
        }
    })
}

function initDelete() {
    const cmdDelete = document.getElementById('delete-site');
    cmdDelete.addEventListener('click', () => {
        if (confirm('_Delete this host from your list?_')) {
            const nameElement = document.getElementById('site-name');
            deleteHost(nameElement.innerText.trim());
            listSites();
            reSetName();
        }
    })
}

function siteLi(name, value) {
    const li = document.createElement('li');
    li.appendChild(makeCheckbox(value));
    li.appendChild(makeAnchor(name, value));
    return li;
}

function _listSites(sites) {
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';
    for (const [key, value] of Object.entries(sites)) {
        if (key.length > 0) {
            sitesList.appendChild(siteLi(key, value));
        }
    }
}

function listSites() {
    chrome.storage.local.get(null, sites1 => {
        _listSites(sites1);
        sites = sites1;
    });
}

function init() {
    /* require (2x) werkt hier dankzij monaco library */
    require.config({ paths: {
            'vs': '../' + vsPath,
        }});
    require(['vs/editor/editor.main'], () => {});

    initToggle();
    initDelete();
    listSites();
}

init();
