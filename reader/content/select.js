import {initedHost, keysGeneral, StorageArea, styleIds} from "../shared/constants.js";
import {headToVault} from "./vault.js";
import {injectStyle} from "./styles.js";

const ftSiteContentStyle = `
    margin-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    max-width: 780px;
    min-width: 240px;
    padding-left: 20px;
    padding-right: 20px;
    position: relative;
    width: 100%;
`;

function headerTitle() {
    const div = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = document.title;
    h2.className = 'reader-title';
    div.appendChild(h2);
    const oldMeta = document.querySelector('old-meta[name=description]');
    if (oldMeta) {
        const p = document.createElement(('p'));
        p.textContent = document.querySelector('old-meta[name=description]').getAttribute('content');
        div.appendChild(p);
    }
    div.style.cssText = ftSiteContentStyle;
    return div;
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

function replaceHead() {
    headToVault();
    StorageArea.get([keysGeneral.default, keysGeneral.dark], results => {
        const defaultStyle = results[keysGeneral.default];
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
        const darkStyle = results[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkext = darkStyle;
    });
}

function injectArticle(nodes, hostName) {
    const readerArticle = createArticle(nodes);
    const container = createContainer();
    container.appendChild(readerArticle);
    replaceHead();
    setTimeout(() => {
        try {
            document.body.appendChild(container);
            console.log('readerArticle appended');
            readerArticle.focus();
        } catch (err) {
            console.log(err.message);
            console.log(hostName)
        }
    }, 100);
}

function reSelect(req, hostName) {
    select(req.selector, hostName);
}

function deleteReaderArticle() {
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

function select(selector, hostName) {
    deleteReaderArticle();
    if (selector && selector.length > 0) {
        const selectors = selector.trim().split('\n');
        const nodes = getNodes(selectors);
        if (nodes.length > 0) {
            injectArticle(nodes, hostName);
            setFocus();
            return true;
        } else {
            console.log('No content for reader found');
        }
    }
    return false;
}

export {select, reSelect, deleteReaderArticle}
