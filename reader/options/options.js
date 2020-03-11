import {sendMessage} from '../shared/constants.js';
// import {popup} from "../popup/popupState.js";

function getStorage(cb) {
    chrome.storage.local.get(null,
        response => cb(response));
}

function dumpStorage() {
    getStorage(data => {
        console.log('storage dump');
        console.dir(data);
    })
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
    const filename = 'readerdata.json'; // should contain date
    const json = JSON.stringify(data);
    const systemlibraryurl = 'http://localhost:3006';
    const opts = {
        path: '/Volumes/Media/Download/' + filename,
        data: json
    };
    // console.log(opts);
    fetch(systemlibraryurl + '/save', {
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

function restore() {

}

function bindControls() {
    const bindings = [
        ['save', save],
        ['restore', restore]
    ];
    for (const [id, fun] of bindings) {
        document.getElementById(id)
            .addEventListener('click', () => fun());
    }
}

// dumpStorage();
listStorage();
bindControls();
