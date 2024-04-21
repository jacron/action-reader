import {parseFunctionInStyle} from "../shared/parse/parse.js";
import {initedHost, KEY_CLASSES, KEY_IDS, keysGeneral, StorageArea, styleIds} from "./constants.js";
import {deleteReaderArticle, reSelect, select} from "./select.js";


/* initieel is readerOn true, als een soort quasi global hier */
let readerOn = true;

/* ft.com has some hard to hide elements */
let annoying = [];

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
    /* correct later injected styles */
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
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    if (immersive) {
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    parseFunctionInStyle(websiteProps.default, results => annoying = results);
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
    if (annoying.length) {
        for (const selector of annoying.split('\n')) {
            console.log(selector)
            try {
                const element = document.querySelector(selector);
                if (element) element.style.display = 'none';
            } catch (e) {
                console.error(e)
            }
        }

    }
}

export function main() {
    console.log("*** contentscript loaded for jreader!");
    contentInitHost().then(() => {
        getClassAndIdNames();
        hideAnnoying();
    });
    chrome.runtime.onMessage.addListener(messageListener);
}

export {injectStyle, removeStyle}
