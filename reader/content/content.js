import {parseFunctionInStyle} from "./parse.js";
import {initedHost, KEY_CLASSES, KEY_IDS, keysGeneral, StorageArea, styleIds} from "./constants.js";


/* initieel is readerOn true, als een soort quasi global hier */
let readerOn = true;

function getHostDelay(hostName) {
    const keys = [hostName];
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            const obj = results[hostName];
            if (obj) {
                resolve(obj.delay);
            }
        });
    })
}

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/https?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function injectStyle(css, id) {
    removeStyle(id);
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
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
        const node = document.querySelector(sel);
        if (node) {
            nodes.push(node);
        } else if (!optional) {
            console.log(`*${sel}* is not a node`);
            nodes = [];
            break;
        }
    }
    return nodes;
}

function injectArticle(nodes) {
    const readerArticle = createArticle(nodes);
    const container = createContainer();
    container.appendChild(readerArticle);
    setTimeout(() => {
        document.body.appendChild(container);
        console.log('readerArticle appended');
        readerArticle.focus();
    }, 100);
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
    deleteReader();
    if (selector && selector.length > 0) {
        const selectors = selector.trim().split('\n');
        const nodes = getNodes(selectors);
        if (nodes.length > 0) {
            injectArticle(nodes);
            setFocus();
            return true;
        } else {
            console.log('No content for reader found');
        }
    }
    return false;
}

function addDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.add('dark')
    }
    document.body.classList.add('dark');
    const {custom, darkText} = initedHost;
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
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

function reSelect(req) {
    select(req.selector);
}

function deleteReaderArticle() {
    deleteReader();
}

function replaceStyle(req) {
    injectStyle(req.css, req.id);
}

function removeStyles() {
    for (const theme in styleIds) {
        for (const styleId of Object.values(styleIds[theme])) {
            removeStyle(styleId);
        }
    }
}

function toggleGeneralContent(req) {
    const {mode} = req;
    if (mode) {
        contentInitHost().then();
    } else {
        removeStyles();
        deleteReaderArticle();
    }
}

function toggleDarkContent(req) {
    const {mode} = req;
    if (mode) {
        addDark();
    } else {
        removeDark();
    }
}

function reinjectStyles() {
    const {custom, darkText, defaultText} = initedHost;
    /* dark styles */
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
    /* default styles */
    injectStyle(custom.default, 'splash-custom-default-style');
    injectStyle(defaultText, 'splash-default-style');
    hideAnnoying();
}

function toggleDark() {
    if (document.body.classList.contains('dark')) {
        removeDark();
    } else {
        addDark();
    }
}

function toggleReader() {
    readerOn = !readerOn;
    if (readerOn) {
        contentInitHost().then();
    } else {
        removeStyles();
        deleteReaderArticle();
    }
}

const actionBindings = {
    replaceStyle,
    reSelect,
    toggleGeneralContent,
    toggleDarkContent,
    toggleDark,
    toggleReader
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

function fromStorage(keys) {
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

function getClassAndIdNames() {
    /* verzamel class namen voor autocomplete lijst in monaco editor */
    /* gebruik een set om dubbelen te voorkomen */
    const classes = new Set();
    const ids = new Set();

    document.querySelectorAll('*').forEach(element => {
        element.classList.forEach(className => {
            classes.add(className);
        });
        if (element.id) {
            ids.add(element.id);
        }
    });
    StorageArea.set({[KEY_CLASSES]: Array.from(classes)}).then();
    StorageArea.set({[KEY_IDS]: Array.from(ids)}).then();
}

async function setDefaultStyles(websiteProps, immersive) {
    if (immersive) {
        const defaultStyleObject = await fromStorage(keysGeneral.default);
        const defaultStyle = defaultStyleObject[keysGeneral.default];
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    parseFunctionInStyle(websiteProps.default);
    injectStyle(websiteProps.default, styleIds.custom.default);
}

async function setDarkStyles(websiteProps, immersive) {
    if (immersive) {
        const darkStyleObject = await fromStorage(keysGeneral.dark);
        const darkStyle = darkStyleObject[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkText = darkStyle;
    }
    injectStyle(websiteProps.dark, styleIds.custom.dark);
    document.body.classList.add('dark');
}

async function setStyles(websiteProps) {
    initedHost.custom = websiteProps;
    if (websiteProps && websiteProps.active === 'on') {
        /* als er geen selector aanwezig is of van toepassing is, is immersive false */
        const immersive = select(websiteProps.selector);
        await setDefaultStyles(websiteProps, immersive);
        await setDarkStyles(websiteProps, immersive);
    }
}

async function contentInitHost() {
    console.log('*** in contentInitHost');
    const hostName = getJcReaderHost(document.location.href);
    console.log('*** hostname=' + hostName)
    const websitePropsObject = await fromStorage(hostName);
    if (websitePropsObject) {  // host exists
        StorageArea.set({['hostname']: hostName}, () => {});
        await setStyles(websitePropsObject[hostName]);
        getHostDelay(hostName).then(delay => {
            if (delay) {
                setTimeout(() => reinjectStyles(), +delay);
            }
        })
    }
}

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse);
}

function hideAnnoying() {
    // experimental
    for (const selector of [
        '.article__content-sign-up',
        '.share-nav',
        '#n-exponea-bottom-slot'
    ]) {
        const element = document.querySelector(selector);
        if (element) element.style.display = 'none';
    }
}

export function main() {
    console.log("*** contentscript loaded for jreader!");
    contentInitHost().then(() => {
        getClassAndIdNames();
    });
    chrome.runtime.onMessage.addListener(messageListener);
    hideAnnoying();
}

export {injectStyle, removeStyle}
