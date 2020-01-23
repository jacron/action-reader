let activeHost;
let activeDoc;

function postNew() {
    const demoCss = `
    body { color: blue !important; }
    `;
    console.log('activeHost', activeHost);
    sendMessage({
        request: 'storeHost',
        host: activeHost
    }, () => {
        // initEditor(demoCss, '[]');
        documents.css.text = demoCss;
        documents.selector.text = '[]';
        setEditor(documents.css);
        toggleForms(true);
    });
}

function setEditor(doc) {
    activeDoc = doc;
    // console.log(doc);
    if (doc.editor === null) {
        console.log('init editor');
        initEditor(doc);
    }
    showEditor(doc);
}

function initTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = documents[tab];
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
}

function removeSelected(tabs) {
    const selectedTabs = tabs.querySelectorAll(dynClass.SELECTED.selector);

    for (let i = 0; i < selectedTabs.length; i++) {
        selectedTabs[i].classList.remove(dynClass.SELECTED.className);
    }

}

function selectTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = documents[tab];

    removeSelected(tabs);
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
    setEditor(doc);
}

function setTabActions() {
    const tabs = document.getElementById('tabs');
    tabs.addEventListener('click', e => {
        const target = e.target;
        const tabs = ['css', 'selector', 'default', 'dark'];
        for (const tab of tabs) {
            if (~target.classList.value.indexOf(tab)) {
                selectTab(tab);
            }
        }
    });
}

function deleteReader() {
    if (confirm(`'${activeHost}' verwijderen?`)) {
        sendMessage({request: 'deleteHost', host: activeHost },
            () => toggleForms(false));
    }
}

function updateDocument(doc) {
    doc.text = doc.editor.getValue();
}

function save() {
    /** saveHost css and selector => saveHost active document */
    updateDocument(activeDoc);
    console.log('activeDoc', activeDoc);
    sendMessage({
        request: 'saveHost',
        name: activeDoc.name,
        text: activeDoc.text,
        styleId: activeDoc.styleId,
        host: activeHost,
    }, response => {console.log(response)});
}

function apply() {
    updateDocument(activeDoc);
    sendMessage({
            request: 'applyHost',
            name: activeDoc.name,
            text: activeDoc.text,
            host: activeHost,
            styleId: activeDoc.styleId,
        },
        response => {console.log(response)});
}

function resetReader() {
    sendMessage({
        request: 'removeCss',
    }, () => {});
}

function closeMe() {
    sendMessage({request: 'closePopup'});
}

function setReaderActions() {
    const clickBindings = [
        ['new-answer-no', closeMe],
        ['new-answer-yes', postNew],
        ['reader-delete', deleteReader],
        ['cmd-save', save],
        ['cmd-apply', apply],
        ['cmd-reset', resetReader],
    ];
    for (const binding of clickBindings) {
        const [id, fun] = binding;
        const element = document.getElementById(id);
        if (!element) {
            console.error('no element found with id:', id);
        }
        element.addEventListener(
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
        initTab('css');
        if (s.selector) {
            const selEntries = Object.entries(s.selector);
            if (!selEntries || selEntries.length === 0) {
                s.selector = '';
            }
        }
        documents.css.text = s.css;
        documents.selector.text = s.selector;
        console.log('documents', documents);
        // initEditor(documents.css);
        setEditor(documents.css);
    }
}

function initFormEvents() {
    setReaderActions();
    setTabActions();
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        // console.log('req', req);
        if (req.result) {
            document.getElementById('host-name').innerText = req.host;
            show(req.result, req.host);
        } else {
            sendResponse('no request handled');
        }
});

function initJcReader() {
    sendMessage({request: 'getInitial'},
        response => {
            // console.log('initial data', response);
            activeHost = response.activeHost;
            sendMessage({
                    request: 'fetchHost',
                    host: activeHost}, () => { });
        });
}

function dumpStorage() {
    chrome.storage.local.get(null,
            response => {
                console.log('storage dump');
                console.dir(response);
            });
}

function hideEditors() {
    for (const [key,value] of Object.entries(documents)) {
        document.getElementById(value.id).style.visibility = 'hidden';
    }
}

function showEditor(doc) {
    hideEditors();
    document.getElementById(doc.id).style.visibility = 'visible';
}

function initEditor(doc) {
    const editorElement = document.getElementById(doc.id);
    if (!editorElement) {
        console.error('no element with id:', doc.id);
    }

    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        doc.editor = monaco.editor.create(editorElement, {
            lineNumbers: false,
            value: doc.text,
            language: doc.language,
            theme: 'vs-dark',
            automaticLayout: true,
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    dumpStorage();
    initFormEvents();
    initJcReader();
});
