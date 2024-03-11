import {vsPath} from "../../shared/constants.js";

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

function setName(name) {
    document.getElementById('site-name').innerText = name;
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

function showEditors(value) {
    const toggle = document.getElementById('toggle-container');
    toggle.style.display = 'block';
    if (editors.selector) {
        editors.selector.setValue(value.selector);
    } else {
        editors.selector = createEditor(value.selector, '', 'editor-selector');
    }
    if (editors.default) {
        editors.default.setValue(value.default);
    } else {
        editors.default = createEditor(value.default, 'scss', 'editor-default');
    }
    if (editors.dark) {
        editors.dark.setValue(value.dark);
    } else {
        editors.dark = createEditor(value.dark, 'scss', 'editor-dark');
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

function makeEditButton(name, value) {
    const button = document.createElement('button');
    button.innerText = 'show';
    button.addEventListener('click', () => {
        setName(name);
        showEditors(value);
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
    chrome.storage.local.get(null, sites1 => {
        listSites(sites1, 'storagelist');
        sites = sites1;
        require.config({ paths: {
                'vs': '../' + vsPath,
            }});
        require(['vs/editor/editor.main'], () => {});
        initToggle();
    })
}

init();
