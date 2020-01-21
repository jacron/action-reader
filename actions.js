// function getHost(name) {
//     const host = new Host(name);
//     return host.get();
// }

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();
    sendResponse({data: 'ok'});
}

function save(req, sendResponse) {
    injectCss(req.css, tabId);
    const host = new Host(req.host);
    host.setCss(req.css);
    host.setSelector(req.selector);
    host.store();
    sendResponse({data: 'ok'});
}

function apply(req, sendResponse) {
    injectCss(req.css, tabId);
    reInjectMakeReader(req.selector, tabId);
    // save(req, sendResponse);
    sendResponse({data: 'ok'});
}

function getInitial(req, sendResponse) {
    sendResponse({activeHost});
}

function closePopup() {
    chrome.windows.remove(winId);
    winId = null;
}

function deleteHost(req, sendResponse) {
    const host = new Host(req.host);
    host.delete();
    sendResponse({data: 'ok'});
}

function removeCss(req, sendResponse) {
    removeStyle();
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
            result: response || {}
        });
    }).catch(err => console.error(err));
    sendResponse({data: 'ok'});
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    /** these functions are named identical to the request
     * each function is called with the two parameters:
     * req and sendResponse */

    const bindings = {
        fetchHost,
        getInitial,
        save,
        apply,
        removeCss,
        closePopup,
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

