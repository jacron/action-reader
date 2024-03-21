console.log("*** contentscript loaded for jreader!");

const StorageArea = chrome.storage.local;
const keysGeneral = {
    default: '_default',
    dark: '_dark'
}

const styleIds = {
    custom: {
        default: 'splash-custom-default-style',  // 'custom-default-style-id',
        dark: 'splash-custom-dark-style'  // 'custom-dark-style-id'
    },
    general: {
        default: 'splash-default-style',  // 'general-default-style-id',
        dark: 'splash-dark-style'  // 'general-dark-style-id'
    }
}

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function injectStyle(css, id) {
    if (!document.getElementById(id)) {
        const styleElement = document.createElement('style');
        styleElement.id = id;
        styleElement.innerHTML = css;
        document.head.appendChild(styleElement);
    } else {
        document.getElementById(id).innerHTML = css;
    }
}

function removeStyle(id) {
    const style = document.getElementById(id);
    if (style) style.parentNode.removeChild(style);
    // else console.log(id + ' is een onbekend style element')
}

function createArticle(nodes) {
    const article = document.createElement('div');
    for (let node of nodes) {
        if (node.cloneNode) {
            const clone = node.cloneNode(true);
            article.appendChild(clone);
        }
    }
    article.id = 'readerarticle';
    article.setAttribute('tabIndex', '-1');
    return article;
}

function createContainer() {
    const container = document.createElement('div');
    container.className = 'content-container';
    container.id = 'readercontainer';
    return container;
}

function getNodes(selector) {
    let nodes = [];
    for (let sel of selector) {
        if (sel.startsWith('//') || sel.length === 0) {
            continue;
        }
        let optional = sel[0] === '@';
        if (optional) {
            sel = sel.substring(1);
        }
        console.log(sel)
        const node = document.querySelector(sel);
        if (node) {
            nodes.push(node);
        } else if (!optional) {
            console.log(sel, ' is not a node');
            nodes = [];
            break;
        }
    }
    // console.log(nodes)
    return nodes;
}

function injectArticle(nodes) {
    if (nodes.length > 0) {
        const readerArticle = createArticle(nodes);
        const container = createContainer();
        container.appendChild(readerArticle);
        setTimeout(() => {
            document.body.appendChild(container);
            console.log('readerArticle appended');
            readerArticle.focus();
        }, 100);
    } else {
        console.log('No content for reader found');
    }
}

function deleteReader() {
    const article = document.getElementById('readercontainer');
    if (article) {
        document.body.removeChild(article);
    }
}

function setFocus() {
    setTimeout(() => {
        const readerArticle = document.getElementById('readerarticle');
        if (readerArticle) {
            readerArticle.focus();
        }
    }, 1000)
}

function select(selector) {
    console.log(selector)
    deleteReader();
    if (selector && selector.length > 0) {
        const selectors = selector.trim().split('\n');
        const timeout = 10;
        setTimeout(() => {
            const nodes = getNodes(selectors);
            injectArticle(nodes);
        }, timeout);
        setFocus();
    }
}

function addDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.add('dark')
    }
    document.body.classList.add('dark');
    injectStyle(initedHost.custom.dark, 'splash-custom-dark-style');
    injectStyle(initedHost.darkText, 'splash-dark-style');
    setTimeout(() => {
    });
}

function removeDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.remove('dark');
    }
    document.body.classList.remove('dark');
    removeStyle('splash-custom-dark-style');
    removeStyle('splash-dark-style');
    setTimeout(() => {
    });
}

let initedHost = null; // {custom, darkText, defaultText}

function onInitHost(req) {
    const {custom, darkText, defaultText} = req;
    initedHost = req;
    if (custom && custom.active === 'on')
    {
        injectStyle(defaultText, 'splash-default-style');
        injectStyle(darkText, 'splash-dark-style');
        injectStyle(custom.default, 'splash-custom-default-style');
        injectStyle(custom.dark, 'splash-custom-dark-style');
        setTimeout(() => {
            select(custom.selector);
        }, 200);
    }
}

function reSelect(req) {
    select(req.selector);
}

function deleteReaderArticle() {
    deleteReader();
}

function replaceStyle(req) {
    injectStyle(req.css, req.id);
}

function _voidStyle(id) {
    const style = document.getElementById(id);
    if (style) style.innerHTML = '';
    // else console.log(req.id + ' is een onbekende style')
}

function voidStyle(req) {
    _voidStyle(req.id);
}

function removeStyles() {
    for (const theme in styleIds) {
        for (const styleId of Object.values(styleIds[theme])) {
            removeStyle(styleId);
        }
    }
}

function toggleGeneralContent(req, sendResponse) {
    const {mode} = req;
    console.log(mode)
    if (mode === 'off') {
        removeStyles();
        deleteReaderArticle();
    } else {
        initHost().then();
    }
}

const actionBindings = {
    onInitHost,  // called from initHost (actions.js)
    replaceStyle,
    reSelect,
    deleteReaderArticle,
    removeDark,
    addDark,
    voidStyle,
    toggleGeneralContent  // nieuw
};

function initActions(req, sendResponse) {
    if (req.message) {
        const func = actionBindings[req.message];
        if (func) {
            func(req);
            sendResponse('okay');
        } else {
            console.error('invalid request', req.message);
            sendResponse('invalid request:' + req.message);
        }
    }
}

/*

 */
chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        console.log(req)
        initActions(req, sendResponse);
});

function fromStorage(keys) {
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

async function injectCustomStyles(websiteProps) {
    injectStyle(websiteProps.default, styleIds.custom.default);
    injectStyle(websiteProps.dark, styleIds.custom.dark);
}

function injectGeneralStyles(defaultStyle, darkStyle) {
    injectStyle(defaultStyle, styleIds.general.default);
    injectStyle(darkStyle, styleIds.general.dark);
}

/*
alternatief voor initHost via background
 */
async function initHost() {
    const hostName = getJcReaderHost(document.location.href);
    const websitePropsObject = await fromStorage(hostName);
    const websiteProps = websitePropsObject[hostName];
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const darkStyleObject = await fromStorage(keysGeneral.dark);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    const darkStyle = darkStyleObject[keysGeneral.dark];
    if (websiteProps.active === 'on') {
        injectGeneralStyles(defaultStyle, darkStyle);
        injectCustomStyles(websiteProps).then();
        setTimeout(() => {
            select(websiteProps.selector);
        }, 200);
    }
    // {custom, darkText, defaultText}
    initedHost = {
        custom: websiteProps,
        darkText: darkStyle,
        defaultText: defaultStyle
    }
}

initHost().then();

/*
message to background.js
initHost in actions:
 */
// chrome.runtime.sendMessage({
//     request: 'initHost',
//     client: 'content'
// }).then();

