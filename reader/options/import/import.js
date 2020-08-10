import {bind} from "../../lib/util.js";
import {initDrop} from "../../lib/drop.js";

const inputFile = document.getElementById('input-file');
let sitesData = null;

function updateStatus(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(function() {
        status.textContent = '';
    }, 8000);
}

function createAnchor(value) {
    const anchor = document.createElement('a');
    anchor.href = 'https://' + value;
    anchor.innerText = value;
    anchor.setAttribute('target', '_blank');
    return anchor;
}

function restoreFromImport() {
    // console.log(sitesData);
    if (confirm('Restore all site settings?')) {
        chrome.storage.local.set(sitesData, () => updateStatus('Imported options restored.'));
    }
}

function listSites(data, rlist) {
    const list = document.getElementById(rlist);
    list.innerHTML = '';
    const entries = Object.entries(data);
    for (const entry of entries) {
        const [site, options] = entry;
        // const {active} = options;
        const item = document.createElement('li');
        if (site[0] !== '_' && site.length !== 0) {
            // const checkbox = createCheckbox(site, active === 'on');
            // item.appendChild(checkbox);
            const anchor = createAnchor(site);
            item.appendChild(anchor);
            list.appendChild(item);
        }
    }
}

function onReaderLoad(e) {
    const sites = JSON.parse(e.target.result);
    sitesData = sites;
    listSites(sites, 'retrievedlist');
    showRestoreButton(true);
}

function importOptions(e) {
    e.preventDefault();
    const file = inputFile.files[0];
    if (!file) {
        alert('no file choosen');
        return;
    }
    const fileReader = new FileReader();
    fileReader.onload = onReaderLoad;
    fileReader.readAsText(file);
}

function bindControls() {
    bind('click', [
        ['btn-import', importOptions],
        ['btn-store', restoreFromImport],
    ]);
}

function showRestoreButton(mode) {
    const rbutton = document.getElementById('btn-store');
    rbutton.style.visibility = mode ? 'visible' : 'hidden';
}

bindControls();
initDrop('content', 'input-file', () => {});
showRestoreButton(false);
