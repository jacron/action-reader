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

function listSites(data, rlist, item) {
    const list = document.getElementById(rlist);
    const itemTemplate = document.getElementById(item);
    const entries = Object.entries(data);
    // console.log('entries', entries);
    for (const entry of entries) {
        const item = itemTemplate.cloneNode(false);
        item.innerText = entry[0];
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
        store(data, msg => console.log(msg));
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

function bindControls() {
    const bindings = [
        ['save', save],
        ['load', load],
        ['restore', restore],
    ];
    for (const [id, fun] of bindings) {
        document.getElementById(id)
            .addEventListener('click', () => fun());
    }
}

function showRestoreButton(mode) {
    const button = document.getElementById('restore');
    button.style.visibility = mode ? 'visible' : 'hidden';
}

listStorage();
bindControls();
showRestoreButton(false);
