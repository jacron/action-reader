import {parseFunctionInStyle} from "../shared/parse/parse.js";
import {initedHost, keysGeneral, StorageArea, styleIds} from "../shared/constants.js";
import {deleteReaderArticle, reSelect, select} from "./select.js";
import {getClassAndIdNames} from "../shared/suggestions.js";
import {vaultToHead} from "./vault.js";


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

function removeMyStyles() {
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
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
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
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
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
        // console.log(req)
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

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse);
}

/**
 * laat js elementen verbergen... maar let erop dat het element readerarticle een duplicaat is
 * dus verberg alle elementen die op een selector passen
 */
function hideAnnoying() {
    if (annoying.length) {
        for (const selector of annoying.split('\n')) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements) {
                    for (const element of elements) {
                        element.style.display = 'none';
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }

    }
}

async function setDefaultStyles(websiteProps, immersive) {
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    if (immersive) {
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    injectStyle(websiteProps.default, styleIds.custom.default);
    parseFunctionInStyle(websiteProps.default, results => annoying = results);
}

async function setDarkStyles(websiteProps, immersive) {
    if (immersive) {
        const darkStyleObject = await fromStorage(keysGeneral.dark);
        const darkStyle = darkStyleObject[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkText = darkStyle;
    }
    else {
        injectStyle(websiteProps.dark, styleIds.custom.dark);
        document.body.classList.add('dark');
    }
}

async function setStyles(websiteProps, hostName) {
    /* als er geen selector aanwezig is of van toepassing is, is immersive false */
    const immersive = select(websiteProps.selector, useHeaderTitle);
    await setDefaultStyles(websiteProps, immersive);
    await setDarkStyles(websiteProps, immersive);
    getHostDelay(hostName).then(delay => {
        if (delay) {
            setTimeout(() => reinjectStyles(), +delay);
        }
    })
}

async function contentInitHost(hostName) {
    console.log('*** in contentInitHost');
    if (!hostName) {
        hostName = getJcReaderHost(document.location.href);
    }
    console.log('*** hostname=' + hostName)
    const websitePropsObject = await fromStorage(hostName);
    if (websitePropsObject) {  // host exists
        StorageArea.set({['hostname']: hostName}, () => {});
        const websiteProps = websitePropsObject[hostName];
        initedHost.custom = websiteProps;
        if (websiteProps && websiteProps.active === 'on') {
            await setStyles(websiteProps, hostName);
        }
    }
}

const archiveIsUrl = 'https://archive.is/search/?q=';

function redirectFt() {
    const barrierPage = document.getElementById('barrier-page');
    if (barrierPage) {
        document.location.href = archiveIsUrl + document.location.href;
    }
}

function clickLastIsItem() {
    const divs = document.querySelectorAll('.THUMBS-BLOCK > div');
    if (divs) {
        const lastDiv = divs[divs.length - 1];
        if (lastDiv) {
            const lastRef = lastDiv.querySelector('a');
            lastRef.click();
            return true;
        }
    }
    return false;
}

function isReaderHost() {
    const q = document.forms[0].querySelector('input[name=q]');
    return getJcReaderHost(q.value);
}

function redirectIs() {
    const hostName = getJcReaderHost(document.location.href);
    if (hostName === 'archive.is') {
        if (!clickLastIsItem()) {
            useHeaderTitle = true;
            return isReaderHost()
        }
    }
    return null;
}

let useHeaderTitle = false;

/**
 * this export is making content.js a module
 */
export function main() {
    console.log("*** contentscript loaded for jreader!");
    redirectFt();
    const host = redirectIs();
    contentInitHost(host).then(() => {
        getClassAndIdNames();
        hideAnnoying();
    });
    chrome.runtime.onMessage.addListener(messageListener);
}

export {injectStyle, removeStyle}
