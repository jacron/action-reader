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
    const host = new Host(req.host);

    applyHost(req, sendResponse);
    switch (req.doc.name) {
        case 'css':
            // host.setCss(req.doc.text);
            host.store({css: req.doc.text});
            break;
        case 'selector':
            host.store({selector: req.doc.text});
            break;
        case 'default':
            storeDefault(req.doc.text);
            break;
        case 'dark':
            storeDark(req.doc.text);
            break;
    }
    sendResponse({data: 'ok'});
}

function applyHost(req, sendResponse) {
    if (req.doc.language === 'css') {
        injectCss(req.doc, tabId);
    }
    if (req.doc.language === 'javascript') {
        reInjectMakeReader(req.doc.text, tabId);
    }
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
        // console.log('fetched activeHost', response);
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

