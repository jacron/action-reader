function init() {
    // const storageDump = document.getElementById('storage-dump');
    chrome.storage.local.get(null, sites => {
        // listSites(sites, 'storagelist');
        console.log(sites);
    })

}

init();
