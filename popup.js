let activeHost;
// let cssEditor;

const sendMessage = chrome.runtime.sendMessage;

function postNew() {
    console.log('activeHost', activeHost);
    sendMessage({
        request: 'storeHost',
        host: activeHost
    }, () => toggleForms(true));
}

function setNewReaderActions() {
    document.getElementById('new-answer-no').addEventListener('click',
        () => {
            sendMessage({request: 'closePopup'});  // suicide is painless
        });
    document.getElementById('new-answer-yes').addEventListener('click',
        () => postNew());
}

function deleteReader(host) {
    if (confirm(`'${host}' verwijderen?`)) {
        sendMessage({request: 'delete', host: activeHost },
            () => toggleForms(false));
    }
}

function save() {
    const value = window.cssEditor.getValue();
    sendMessage({request: 'save', host: activeHost}, () => {});
    sendMessage({
            request: 'saveCss',
            css: value,
            host: activeHost,
        },
        response => {console.log(response)});
}

function apply() {
    const value = window.cssEditor.getValue();
    // console.log(value);
    sendMessage({
            request: 'applyCss',
            css: value,
            host: activeHost,
        },
        response => {console.log(response)});
}

function setReaderActions() {
    document.getElementById('reader-save').addEventListener('click',
        () => {save()
    });
    document.getElementById('reader-apply').addEventListener('click',
        () => {apply()
        });
    document.getElementById('reader-delete').addEventListener('click',
        () => deleteReader(activeHost));
}

function toggleForms(hostExists) {
    const existing = document.getElementById('existing-reader-dialog');
    const newview = document.getElementById('new-reader-dialog');
    if (hostExists) {
        existing.style.display = 'block';
        newview.style.display = 'none';
    } else {
        existing.style.display = 'none';
        newview.style.display = 'block';
    }
}

function show(s) {
    const entries = Object.entries(s);  // just for counting
    const hostExists = entries.length > 0;
    toggleForms(hostExists);
    if (hostExists) {
        // console.log(s.css);
        initEditors(s);
    }
}

function initFormEvents() {
    setReaderActions();
    setNewReaderActions();
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        // console.log('req', req);
    if (req.result) {
        const hostName = document.getElementById('host-name');
        // console.log('activeHost data', req.result);
        hostName.innerText = req.host;
        show(req.result, req.host);
    } else {
        sendResponse('no request handled');
    }
});

function initJcReader() {
    sendMessage({
        request: 'getInitial'
    },
        response => {
            // console.log('initial data', response);
            activeHost = response.activeHost;
            // console.log('activeHost', activeHost);
            sendMessage({
                    request: 'fetchHost',
                    host: activeHost
                }, () => { });
        });
}

function dumpStorage() {
    chrome.storage.local.get(null,
            response => console.dir(response));
}

function createScript(src) {
    const script = document.createElement('srcript');
    script.src= "node_modules/monaco-editor/min/vs/loader.js";
    return script;
}

function initEditors(s) {
    const cssEditor = document.getElementById('css-editor');
    const demoValue = [
        'body {',
        '\tcolor: red !important;',
        '}'
    ].join('\n');
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        window.cssEditor = monaco.editor.create(cssEditor, {
            value: s.css,
            language: 'css'
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // dumpStorage();
    initFormEvents();
    initJcReader();
    // initEditors();
});
