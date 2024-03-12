import {bind} from "../../lib/util.js";
import {download} from "../../lib/download.js";
import {listSites} from "../shared/sites.js";

let sitesData = null;
function exportSettings() {
    download(sitesData, 'jreader sites.json');
}

function bindControls() {
    bind('click',[
        ['export', exportSettings],  // id, listener
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
