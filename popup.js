let activeHost;
// let cssEditor;

const sendMessage = chrome.runtime.sendMessage;

function postNew() {
    const demoCss = `
    body { color: blue !important; }
    `;
    console.log('activeHost', activeHost);
    sendMessage({
        request: 'storeHost',
        host: activeHost
    }, () => {
        initEditors(demoCss, '[]');
        toggleForms(true);
    });
}

function setNewReaderActions() {
    document.getElementById('new-answer-no').addEventListener('click',
        () => {
            sendMessage({request: 'closePopup'});  // suicide is painless
        });
    document.getElementById('new-answer-yes').addEventListener('click',
        () => postNew());
}

function selectTab(tab) {
    const tabs = document.getElementById('tabs');
    const cssTab = tabs.querySelector('.css');
    const selectorTab = tabs.querySelector('.selector');
    const cssEditor = document.getElementById('css-editor');
    const selectorEditor = document.getElementById('selector-editor');

    if (tab === 'css') {
        cssTab.classList.add('selected');
        selectorTab.classList.remove('selected');
        cssEditor.style.visibility = 'visible';
        selectorEditor.style.visibility = 'hidden';
    } else if (tab === 'selector') {
        cssTab.classList.remove('selected');
        selectorTab.classList.add('selected');
        selectorEditor.style.visibility = 'visible';
        cssEditor.style.visibility = 'hidden';
    }
}

function setTabActions() {
    tabs.addEventListener('click', e => {
        const target = e.target;
        if (~target.classList.value.indexOf('css')) {
            selectTab('css');
        } else if (~target.classList.value.indexOf('selector')) {
            selectTab('selector');
        }
    });
    selectTab('css');
}

function deleteReader() {
    if (confirm(`'${activeHost}' verwijderen?`)) {
        sendMessage({request: 'deleteHost', host: activeHost },
            () => toggleForms(false));
    }
}

function save() {
    const css = window.cssEditor.getValue();
    const selector = window.selectorEditor.getValue();
    // sendMessage({request: 'save', host: activeHost}, () => {});
    sendMessage({
            request: 'save',
            css,
            selector,
            host: activeHost,
        },
        response => {console.log(response)});
}

function apply() {
    const css = window.cssEditor.getValue();
    const selector = window.selectorEditor.getValue();
    sendMessage({
            request: 'apply',
            css,
            selector,
            host: activeHost,
        },
        response => {console.log(response)});
}

function resetReader() {
    // const value = window.cssEditor.getValue();
    console.log('reset');
    sendMessage({
        request: 'removeCss',
    }, response => {});
}

function setReaderActions() {
    const clickBindings = [
        ['reader-delete', deleteReader],
        ['css-save', save],
        ['css-apply', apply],
        ['css-reset', resetReader],
        ['selector-save', save],
        ['selector-apply', apply],
        ['selector-reset', resetReader],
    ];
    for (const binding of clickBindings) {
        const [id, fun] = binding;
        document.getElementById(id).addEventListener(
            'click', () => fun());
    }
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
        initEditors(s.css, s.selector);
    }
}

function initFormEvents() {
    setReaderActions();
    setNewReaderActions();
    setTabActions();
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
    if (req.result) {
        const hostName = document.getElementById('host-name');
        hostName.innerText = req.host;
        show(req.result, req.host);
    } else {
        sendResponse('no request handled');
    }
});

function initJcReader() {
    sendMessage({request: 'getInitial'},
        response => {
            console.log('initial data', response);
            activeHost = response.activeHost;
            sendMessage({
                    request: 'fetchHost',
                    host: activeHost}, () => { });
        });
}

function dumpStorage() {
    chrome.storage.local.get(null,
            response => console.dir(response));
}

function initEditors(css, selectors) {
    const cssEditor = document.getElementById('css-editor');
    const selectorEditor = document.getElementById('selector-editor');

    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        window.cssEditor = monaco.editor.create(cssEditor, {
            value: css,
            language: 'css',
            lineNumbers: false,
            theme: 'vs-dark',
            automaticLayout: true,
        });
        window.selectorEditor = monaco.editor.create(selectorEditor, {
            value: selectors,
            language: 'javascript',
            lineNumbers: false,
            theme: 'vs-dark',
            automaticLayout: true,
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // dumpStorage();
    initFormEvents();
    initJcReader();
});
