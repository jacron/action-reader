import {jsonStorage} from "../shared/constants.js";

function getStorage(cb) {
    chrome.storage.local.get(null,
        response => cb(response));
}

function listStorage() {
    getStorage(data => {
        listSites(data, 'storagelist', 'item');
    })
}

function updateStatus(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
        // window.close();
    }, 4000);
}

function saveToStorage() {
    const inputEls = document.querySelectorAll('#storagelist input');
    getStorage(data => {
        const entries = Object.entries(data);
        for (const entry of entries) {
            const [site, options] = entry;
            for (let i = 0; i < inputEls.length; i++) {
                if (inputEls[i].dataset.site === site) {
                    options.active = inputEls[i].checked;
                }
            }
        }
        console.log(data);
        chrome.storage.local.set(data, () => updateStatus('Options saved.'));
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

function listSites(data, rlist, item) {
    const list = document.getElementById(rlist);
    const itemTemplate = document.getElementById(item);
    // console.log('data', data);
    const entries = Object.entries(data);
    console.log('entries', entries);
    for (const entry of entries) {
        const site = entry[0];
        const {active} = entry[1];
        const item = itemTemplate.cloneNode(false);
        if (site[0] === '_') {
            item.innerText = site;
        } else {
            const checkbox = createCheckbox(site, active);
            item.appendChild(checkbox);
            const anchor = createAnchor(site);
            item.appendChild(anchor);
        }
        list.appendChild(item);
    }
}

function store(data, sendResponse) {
    const json = JSON.stringify(data);
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    const opts = {
        path,
        data: json
    };
    // console.log(opts);
    fetch(`${jsonStorage.url}/save`, {
        method: 'post',
        body: JSON.stringify(opts),
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/json; charset=utf-8'
        },
    }).then(response => response.json())
        .then(data => sendResponse(data));
}

function save() {
    getStorage(data => {
        store(data, msg => {
            console.log(msg);
            updateStatus(`options exported to ${jsonStorage.jsonfile}`);
        });
    })
}

function read(cb) {
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    fetch(`${jsonStorage.url}/text?path=${path}`)
        .then(response => response.json())
        .then(cb);
}

function restore() {
    read(data => {
        const sites = JSON.parse(data);
        console.log('to be restored', sites);
    });
}

function load() {
    read(data => {
        const sites = JSON.parse(data);
        console.log(sites);
        listSites(sites, 'retrievedlist', 'r-item');
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
        ['export', save],
        ['import', load],
        ['restore', restore],
        ['select-all', selectAll],
        ['select-none', selectNone],
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
    const button = document.getElementById('restore');
    button.style.visibility = mode ? 'visible' : 'hidden';
}

listStorage();
bindControls();
showRestoreButton(false);
