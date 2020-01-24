function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();
    sendResponse({data: 'ok'});
}

function saveHost(req, sendResponse) {
    const host = new Host(req.host);

    applyHost(req, sendResponse);
    switch (req.name) {
        case 'css':
            // host.setCss(req.doc.text);
            host.store({css: req.text});
            break;
        case 'selector':
            host.store({selector: req.text});
            break;
        case 'default':
            storeDefault(req.text);
            break;
        case 'dark':
            storeDark(req.text);
            break;
    }
    sendResponse({data: 'ok'});
}

function applyHost(req, sendResponse) {
    // console.log('req (apply)', req);
    if (~['css', 'default', 'dark'].indexOf(req.name )) {
        injectCss(req, tabId);
    }
    if (req.name === 'selector') {
        reInjectMakeReader(req.text, tabId);
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

function fetchHost(req, sendResponse) {
    const host = new Host(req.host);
    host.get().then(response => {
        // console.log('fetched activeHost', response);
        chrome.runtime.sendMessage({
            host: req.host,
            result: response
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
        // console.log('req.request', req.request);
        const fun = bindings[req.request];
        if (fun) {
            fun(req, sendResponse);
        } else {
            sendResponse('invalid request:' + req.request);
        }
    }
});

