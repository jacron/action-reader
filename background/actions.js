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

function fetchHost(req, sendResponse) {
    const host = new Host(req.host);
    host.get().then(response => {
        retrieveDefaultDark().then(data => {
            chrome.runtime.sendMessage({
                host: req.host,
                result: response,
                defaultText: data['_default'],
                darkText: data['_dark']
            });
        });
    }).catch(err => console.error(err));
    sendResponse({data: 'ok'});
}

function reInit(name) {
    const host = new Host(name);
    host.get().then(data => {
        data = data[name];
        injectDefaultDark(tabId);
        documents.css.text = data.css;
        documents.selector.text = data.selector;
        injectCss(documents.css, tabId);
        articleAddDark(tabId);
        reInjectMakeReader(documents.selector.text, tabId);
    })
}
function toggleGeneral(req, sendResponse) {
    const {mode, host} = req;
    if (mode === 'off') {
        removeStyles();
        removeReader();
        articleRemoveDark(tabId);
        sendResponse({data: 'general and custom styles and selector removed'});
    } else {
        reInit(host);
        sendResponse({data: 'general and custom styles and selector added'});
    }
}

function toggleDark(req, sendResponse) {
    const {mode, host} = req;
    if (mode === 'off') {
        removeStyle(documents.dark, tabId);
        articleRemoveDark(tabId);
        sendResponse({data: 'dark styles removed'});
    } else {
        articleAddDark(tabId);
        retrieveDefaultDark().then(data => {
            documents.dark.text = data['_dark'];
            injectCss(documents.dark, tabId);
            sendResponse({data: 'dark styles added'});
        });
    }
}

function scanOn(tabId, sendResponse) {
    const code = `
function scanDom(e) {
    const elements = document.elementsFromPoint(e.x, e.y);
    console.dir(elements);
    chrome.runtime.sendMessage({feedback: elements}, res => {
        console.log(res);
    })
}

document.addEventListener('click', scanDom);`;

    chrome.tabs.executeScript(tabId,{
        file: 'background/scan.js'
        // code
    }, response => {
        // console.log(response);
        if (sendResponse) {
            sendResponse('tool set on')
        }});
}

function toggleSelectorTool(req, sendResponse) {
    if (req.mode === 'on') {
        console.log('mode', req.mode);
        scanOn(tabId, sendResponse);
    } else {
        chrome.tabs.executeScript(tabId,{
            code: 'document.removeEventListener(\'click\', scanDom);\n'
        }, () => {sendResponse('tool set off')});
    }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const bindings = {
        fetchHost,
        getInitial,
        saveHost,
        applyHost,
        closePopup: closeView,
        deleteHost,
        toggleGeneral,
        toggleDark,
        toggleSelectorTool,
    };
    if (req.request) {
        // console.log('req.request', req.request);
        const fun = bindings[req.request];
        if (fun) {
            fun(req, sendResponse);
        } else {
            console.error('invalid request', req.request);
            sendResponse('invalid request:' + req.request);
        }
    }
});

