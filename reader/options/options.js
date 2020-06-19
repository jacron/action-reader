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

function restoreFromImport() {
    if (confirm('Restore all site settings?')) {
        readJson(data => {
            const sites = JSON.parse(data);
            chrome.storage.local.set(sites, () => updateStatus('Imported options restored.'));
        });
    }
}

function listSites(data, rlist) {
    const list = document.getElementById(rlist);
    list.innerHTML = '';
    const entries = Object.entries(data);
    for (const entry of entries) {
        const [site, options] = entry;
        const {active} = options;
        const item = document.createElement('li');
        if (site[0] !== '_' && site.length !== 0) {
            const checkbox = createCheckbox(site, active === 'on');
            item.appendChild(checkbox);
            const anchor = createAnchor(site);
            item.appendChild(anchor);
            list.appendChild(item);
        }
    }
}

// function getDynPathStore() {
//     //chrome-extension://oejelhiehinpiiljmjabfmkkaladcppd/options/options.html
//     const storeUrl = chrome.runtime.getURL('/store');
//     return `${storeUrl}/${jsonStorage.jsonfile}`;
// }

function reveal() {
    // const path = getDynPathStore();
    // console.log('dyn path', path);
    // return;
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    fetch(`${jsonStorage.systemLibraryUrl}/finder?path=${path}`)
        .then(response => response.statusText)
        .then(response => console.log(response));
}

function edit() {
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    fetch(`${jsonStorage.systemLibraryUrl}/open?path=${path}`)
        .then(response => response.statusText)
        .then(response => console.log(response));
}

function store(data, cb) {
    const json = JSON.stringify(data);
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    const opts = {
        path,
        data: json
    };
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
            const file = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
            updateStatus(`options exported to ${file}`);
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
        ['reveal', reveal],
        ['edit', edit]
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
}

listStorage();
bindControls();
showRestoreButton(false);
