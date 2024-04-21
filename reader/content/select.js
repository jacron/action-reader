import {initedHost, keysGeneral, StorageArea, styleIds} from "./constants.js";
import {injectStyle} from "./content.js";

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

function removeElements(selector) {
    const elements = document.head.querySelectorAll(selector);
    for (const element of elements) {
        document.head.removeChild(element);
    }
}

function replaceHead() {
    removeElements('link[rel=stylesheet]');
    removeElements('link[rel=preload]');
    removeElements('link[rel=preconnect]');
    removeElements('style');
    removeElements('script');
    StorageArea.get([keysGeneral.default, keysGeneral.dark], results => {
        const defaultStyle = results[keysGeneral.default];
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
        const darkStyle = results[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkext = darkStyle;
    });
}

function injectArticle(nodes) {
    const readerArticle = createArticle(nodes);
    const container = createContainer();
    container.appendChild(readerArticle);
    replaceHead();
    setTimeout(() => {
        document.body.innerHTML = '';
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

function reSelect(req) {
    select(req.selector);
}

function deleteReaderArticle() {
    deleteReader();
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

export {select, reSelect, deleteReaderArticle}
