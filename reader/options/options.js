import {jsonStorage} from "../shared/constants.js";

function getStorage(cb) {
    chrome.storage.local.get(null,
        response => cb(response));
}

function listStorage() {
    getStorage(data => {
        listSites(data, 'storagelist');
    })
}

function updateStatus(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
        // window.close();
    }, 8000);
}

function saveToStorage() {
    const inputEls = document.querySelectorAll('#storagelist input');
    getStorage(data => {
        const entries = Object.entries(data);
        for (const entry of entries) {
            const [site, options] = entry;
            for (let i = 0; i < inputEls.length; i++) {
                if (inputEls[i].dataset.site === site) {
                    options.active = inputEls[i].checked ? 'on' : 'off';
                }
            }
            options.default = '';
            options.dark = options.css;
        }
        console.log(data);
        // chrome.storage.local.set(data, () => updateStatus('Options saved.'));
    });
}

function createAnchor(value) {
    const anchor = document.createElement('a');
    anchor.href = 'https://' + value;
    anchor.innerText = value;
    anchor.setAttribute('target', '_blank');
    return anchor;
}

function createCheckbox(site, checked) {
    const inputEl = document.createElement('input');
    inputEl.type = 'checkbox';
    inputEl.dataset.site = site;
    inputEl.checked = checked;
    return inputEl;
}

function migrateFromImport() {
    readJson(data => {
        const sites = JSON.parse(data);
        // console.log('original sites', sites);
        const entries = Object.entries(sites);
        for (const entry of entries) {
            const [site, options] = entry;
            const newOptions = {};
            if (site.length === 0) {
                continue;
            }
            if (site[0] === '_') {
            } else {
                newOptions.active = options.active;
                newOptions.default = '';
                newOptions.dark = options.css;
                newOptions.selector = options.selector;
                sites[site] = newOptions;
            }
        }
        // console.log('adjusted sites', sites);
        chrome.storage.local.set(sites, () => updateStatus('Migrated options saved.'));
    });
}

function restoreFromImport() {
    readJson(data => {
        const sites = JSON.parse(data);
        // console.log('to be restored', sites);
        chrome.storage.local.set(sites, () => updateStatus('Imported options restored.'));
    });
}

function listSites(data, rlist) {
    const list = document.getElementById(rlist);
    list.innerHTML = '';
    const entries = Object.entries(data);
    // console.log('entries', entries);
    // console.log('data from storage', data);
    for (const entry of entries) {
        const [site, options] = entry;
        const {active} = options;
        const item = document.createElement('li');
        if (site[0] === '_') {
            item.innerText = site;
        } else {
            const checkbox = createCheckbox(site, active === 'on');
            item.appendChild(checkbox);
            const anchor = createAnchor(site);
            item.appendChild(anchor);
        }
        list.appendChild(item);
    }
}

function store(data, cb) {
    const json = JSON.stringify(data);
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    const opts = {
        path,
        data: json
    };
    // console.log(opts);
    fetch(`${jsonStorage.systemLibraryUrl}/save`, {
        method: 'post',
        body: JSON.stringify(opts),
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/json; charset=utf-8'
        },
    }).then(response => response.json())
        .then(data => cb(data));
}

function exportOptions() {
    getStorage(data => {
        store(data, msg => {
            console.log(msg);
            updateStatus(`options exported to ${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`);
        });
    })
}

function readJson(cb) {
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    fetch(`${jsonStorage.systemLibraryUrl}/text?path=${path}`)
        .then(response => response.json())
        .then(cb);
}

function importOptions() {
    readJson(data => {
        const sites = JSON.parse(data);
        // console.log(sites);
        listSites(sites, 'retrievedlist');
        showRestoreButton(true);
    })
}

function selectAll() {
    const inputEls = Array.from(document.querySelectorAll('input'));
    inputEls.forEach(function(inputEl) {
        inputEl.checked = true;
    });
}

function selectNone() {
    const inputEls = Array.from(document.querySelectorAll('input'));
    inputEls.forEach(function(inputEl) {
        inputEl.checked = false;
    });
}

function bindControls() {
    const bindings = [
        ['save', saveToStorage],
        ['export', exportOptions],
        ['import', importOptions],
        ['select-all', selectAll],
        ['select-none', selectNone],
        ['restore', restoreFromImport],
        ['migrate', migrateFromImport]
    ];
    for (const [id, fun] of bindings) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', () => fun());
        } else {
            console.error('No element found with id=' + id);
        }
    }
}

function showRestoreButton(mode) {
    const rbutton = document.getElementById('restore');
    rbutton.style.visibility = mode ? 'visible' : 'hidden';
    // const mbutton = document.getElementById('migrate');
    // mbutton.style.visibility = mode ? 'visible' : 'hidden';
}

listStorage();
bindControls();
showRestoreButton(false);
