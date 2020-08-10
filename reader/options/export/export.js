import {bind} from "../../lib/util.js";
import {download} from "../../lib/download.js";

let sitesData = null;

function createAnchor(value) {
    const anchor = document.createElement('a');
    anchor.href = 'https://' + value;
    anchor.innerText = value;
    anchor.setAttribute('target', '_blank');
    return anchor;
}

function exportSettings() {
    download(sitesData, 'jreader sites.json');
}

function listSites(data, rlist) {
    const list = document.getElementById(rlist);
    list.innerHTML = '';
    const entries = Object.entries(data);
    for (const entry of entries) {
        const [site, options] = entry;
        const item = document.createElement('li');
        if (site[0] !== '_' && site.length !== 0) {
            const anchor = createAnchor(site);
            item.appendChild(anchor);
            list.appendChild(item);
        }
    }
}

function bindControls() {
    bind('click',[
        ['export', exportSettings],
    ]);
}

function listStorage() {
    chrome.storage.local.get(null, sites => {
        sitesData = sites;
        listSites(sites, 'storagelist');
    })
}

listStorage();
bindControls();
