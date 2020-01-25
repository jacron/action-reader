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
    console.log('activeDoc', activeDoc);
    sendMessage({
            request: 'applyHost',
            name: activeDoc.name,
            text: activeDoc.text,
            host: activeHost,
            styleId: activeDoc.styleId,
        },
        response => {console.log(response)});
}

// function resetReader() {
//     sendMessage({
//         request: 'removeCss',
//     }, () => {});
// }

function closeMe() {
    sendMessage({request: 'closePopup'});
}

function toggle(classList, set) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        set('off');
    } else {
        classList.remove('off');
        classList.add('on');
        set('on');
    }
}

function toggleGeneralSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleGeneral',
            host: activeHost,
            mode});
    })
}

function toggleDarkSettings(e) {
    toggle(e.target.classList, mode => {
        sendMessage({
            request: 'toggleDark',
            host: activeHost,
            mode});
    })
}

function setReaderActions() {
    const clickBindings = [
        ['new-answer-no', closeMe],
        ['new-answer-yes', postNew],
        ['reader-delete', deleteReader],
        ['cmd-save', save],
        ['cmd-apply', apply],
        ['general-toggle-switch', toggleGeneralSettings],
        ['dark-toggle-switch', toggleDarkSettings],
    ];
    for (const binding of clickBindings) {
        const [id, fun] = binding;
        const element = document.getElementById(id);
        if (!element) {
            console.error('no element found with id:', id);
        }
        element.addEventListener(
            'click', fun);
    }
}

function toggleForms(hostExists) {
    const existing = document.getElementById('existing-reader-dialog');
    const newview = document.getElementById('new-reader-dialog');
    const generalControls = document.querySelector('.general-controls');
    if (hostExists) {
        existing.style.display = 'block';
        newview.style.display = 'none';
        generalControls.style.display = 'block';
    } else {
        existing.style.display = 'none';
        newview.style.display = 'block';
        generalControls.style.display = 'none';
    }
}

function show(req) {
    const {host, result, darkText, defaultText} = req;
    const custom = result[host];
    // if (custom)
    // const entries = Object.entries(custom);  // just for counting
    // const hostExists = entries.length > 0;
    toggleForms(custom);
    if (custom) {
        initTab('css');
        documents.css.text = custom.css;
        documents.selector.text = custom.selector;
        documents.default.text = defaultText;
        documents.dark.text = darkText;
        console.log('documents', documents);
        setEditor(documents.css);
    }
}

function initFormEvents() {
    setReaderActions();
    setTabActions();
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        console.log('req', req);
        if (req.result) {
            document.getElementById('host-name').innerText = req.host;
            show(req);
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
    doc.editor.focus();
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

