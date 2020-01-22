// function getHost(name) {
//     const host = new Host(name);
//     return host.get();
// }

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();
    sendResponse({data: 'ok'});
}

function saveHost(req, sendResponse) {
    injectCss(req.css, tabId);
    const host = new Host(req.host);
    host.setCss(req.css);
    host.setSelector(req.selector);
    host.store();
    sendResponse({data: 'ok'});
}

function applyHost(req, sendResponse) {
    injectCss(req.css, tabId);
    reInjectMakeReader(req.selector, tabId);
    sendResponse({data: 'ok'});
}

function getInitial(req, sendResponse) {
    sendResponse({activeHost});
}

function deleteHost(req, sendResponse) {
    const host = new Host(req.host);
    host.delete();
    sendResponse({data: 'ok'});
}

function removeCss(req, sendResponse) {
    removeStyle();
    removeReader();
    sendResponse({data: 'ok'});
}

function getHost(name) {
    const host = new Host(name);
    return host.get();
}

function fetchHost(req, sendResponse) {
    const host = new Host(req.host);
    host.get().then(response => {
        console.log('fetched activeHost', response);
        chrome.runtime.sendMessage({
            host: req.host,
            result: response[req.host]
        });
    }).catch(err => console.error(err));
    sendResponse({data: 'ok'});
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const bindings = {
        fetchHost,
        getInitial,
        saveHost,
        applyHost,
        removeCss,
        closePopup: closeView,
        deleteHost
    };
    if (req.request) {
        const fun = bindings[req.request];
        if (fun) {
            fun(req, sendResponse);
        } else {
            sendResponse('invalid request:' + req.request);
        }
    }
});

