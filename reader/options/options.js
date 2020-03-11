import {jsonStorage} from "../shared/constants.js";

function getStorage(cb) {
    chrome.storage.local.get(null,
        response => cb(response));
}

function listStorage() {
    const list = document.getElementById('list');
    const itemTemplate = document.getElementById('item');
    getStorage(data => {
        const entries = Object.entries(data);
        // console.log('entries', entries);
        for (const entry of entries) {
            const item = itemTemplate.cloneNode(false);
            item.innerText = entry[0];
            list.appendChild(item);
        }
    })
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

function restore(cb) {
    const path = `${jsonStorage.jsonmap}/${jsonStorage.jsonfile}`;
    fetch(`${jsonStorage.url}/text?path=${path}`)
        .then(response => response.json())
        .then(cb);
}

function load() {
    restore(data => {
        // console.log(data);
        const sites = JSON.parse(data);
        console.log(sites);
    })
}

function bindControls() {
    const bindings = [
        ['save', save],
        ['load', load]
    ];
    for (const [id, fun] of bindings) {
        document.getElementById(id)
            .addEventListener('click', () => fun());
    }
}

listStorage();
bindControls();
