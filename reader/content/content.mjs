console.log("*** contentscript loaded for jreader!");

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
    style.parentNode.removeChild(style);
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
    // article.className = 'dark';
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
        if (sel.startsWith('//' || sel.length === 0)) {
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
            console.log(sel, ' is not a node');
            nodes = [];
            break;
        }
    }
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
        // addDark();
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

function voidStyle(req) {
    document.getElementById(req.id).innerHTML = '';
}

const actionBindings = {
    onInitHost,  // called from initHost (actions.js)
    replaceStyle,
    reSelect,
    deleteReaderArticle,
    removeDark,
    addDark,
    voidStyle,
};

function initActions(req, sendResponse) {
    if (req.message) {
        const fun = actionBindings[req.message];
        if (fun) {
            fun(req);
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
        initActions(req, sendResponse);
});

chrome.runtime.sendMessage({
    request: 'initHost',
    client: 'content'
});
