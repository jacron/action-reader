function getJcReaderHost(url) {
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function loadUserscript(tabId) {
    const url = `${config.JcUserscript}`;
    chrome.tabs.update(tabId, {url})
}

function doActionReload(url, tabId) {
    fetch(url)
        .then(res => res.json())
        .then(() => loadUserscript(tabId))
        .catch(err => console.error(err));
}

function doAction(url) {
    // fetch(url)
    //     .then(res => res.json())
    //     .then(result => console.log(result))
    //     .catch(err => console.error(err));
}

function postNew(host) {
    console.log('host', host);
    // const url = `${config.JCApi}/newsite/${host}`;
    chrome.runtime.sendMessage({
        request: 'storeHost',
        host
    }, response => {});
    // fetch(url)
    //     .then(res => res.json())
    //     .then(result => console.log(result))
    //     .catch(err => console.error(err));
}

function setNewReaderActions(host) {
    document.getElementById('new-answer-no').addEventListener('click',
        () => window.close());
    document.getElementById('new-answer-yes').addEventListener('click',
        () => postNew(host));
}

function deleteReader(host) {
    if (confirm(`'${host}' verwijderen?`)) {
        doAction(`${config.JCApi}/delete/${host}`);
    }
}
function setReaderActions(host, tabId) {
    const actionBindings = [
        ['reader-css', '/edit/css?name=' + host],
        ['reader-selector', '/edit/selector?name=' + host],
        ['default-css', '/edit/default'],
        ['dark-css', '/edit/dark'],
    ];
    for (const [binding, endpoint] of actionBindings) {
        document.getElementById(binding).addEventListener('click',
            () => {doAction(`${config.JCApi}${endpoint}`);
            });
    }
    document.getElementById('reader-rebuild').addEventListener('click',
        () => {doActionReload(`${config.JCApi}/build/noview`, tabId);
    });
    document.getElementById('reader-delete').addEventListener('click',
        () => deleteReader(host));
}

function show(s, host, tabId) {
    const existing = document.getElementById('existing-reader-dialog');
    const newview = document.getElementById('new-reader-dialog');
    const entries = Object.entries(s);
    if (entries.length > 0) {
        existing.style.display = 'block';
        setReaderActions(host, tabId);
    } else {
        newview.style.display = 'block';
        setNewReaderActions(host);
    }
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
    if (req.result) {
        const hostName = document.getElementById('host-name');
        console.log(req.result);
        hostName.innerText = req.host;
        show(req.result, req.host);
    } else {
        sendResponse('no request handled');
    }
});

function processJcReader(host, tabId) {
    chrome.runtime.sendMessage({
            request: 'fetchHost',
            host
        },
        response => {
        console.log(response);
    });
}

function initJcReader() {
    chrome.runtime.sendMessage({
        request: 'getInitial'
    },
        response => {
            console.log(response);
            processJcReader(response.host, response.tabId);
        });
}

function dumpStorage() {
    chrome.storage.local.get(null,
            response => console.dir(response));
}

document.addEventListener('DOMContentLoaded', function () {
    dumpStorage();
    initJcReader();
});
