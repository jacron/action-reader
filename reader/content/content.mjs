console.log("contentscript loaded for jreader!");

(async () => {
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

    function parse(s) {
        let selector = [];
        let lines = s.split('\n');
        if (lines.length > 1) {
            for (let line of lines) {
                line = line.trim();
                let words = line.split(',');
                if (words.length > 1) {
                    let selectorWords = [];
                    for (let word of words) {
                        word = word.trim();
                        if (word.length > 0) {
                            selectorWords.push(word);
                        }
                    }
                    selector.push(selectorWords);
                } else {
                    if (line.length > 0) {
                        selector.push(line);
                    }
                }
            }
        } else {
            if (s.length > 0) {
                selector.push(s);
            }
        }
        return selector;
    }

    let Nodes = function (nodes) {
        function createContainer(nodes) {
            const container = document.createElement('div');
            const article = document.createElement('div');

            container.className = 'content-container';

            article.id = 'readerarticle';
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].cloneNode) {
                    const clone = nodes[i].cloneNode(true);
                    // console.log(clone);
                    article.appendChild(clone);
                }
            }
            container.appendChild(article);
            container.id = 'readercontainer';
            return container;
        }

        function getNode(sel) {
            if (sel[0] === '*') {
                return document.querySelectorAll(sel.substring(1));
            } else {
                return document.querySelector(sel);
            }
        }

        function getNodes(sel) {
            let nodes = null;
            if (Array.isArray(sel)) {
                for (let j = 0; j < sel.length; j++) {
                    nodes = getNode(sel[j]);
                    if (nodes) break;
                }
            } else if (sel) {
                nodes = getNode(sel);
            }
            return nodes;
        }

        this.get = selector => {
            for (let i = 0; i < selector.length; i++) {
                let sel = selector[i];
                let optional = false;
                if (sel[0] === '@') {
                    sel = sel.substring(1);
                    optional = true;
                }
                const node = getNodes(sel);
                let found = false;
                if (Array.isArray(node)) {
                    if (node && node.length > 0) {
                        found = true;
                        for (let k = 0; k < node.length; k++) {
                            nodes.push(node[k]);
                        }
                    }
                } else {
                    if (node) {
                        found = true;
                        nodes.push(node);
                    }
                }
                if (!found) {
                    console.log(sel, ' is not a node');
                    if (!optional) {
                        nodes = [];
                        break;
                    }
                }
            }
            return this;
        };

        this.injectArticle = () => {
            if (nodes.length > 0) {
                const container = createContainer(nodes);
                // const div = document.createElement('div');
                // div.appendChild(container);
                // document.body.innerHTML = div.innerHTML;
                setTimeout(() => {
                    document.body.appendChild(container);
                    document.getElementById('readerarticle').className = 'dark';
                }, 100);
            } else {
                console.log('No content for reader found');
            }
            return this;
        };
    };

    function deleteReader() {
        const article = document.getElementById('readercontainer');
        if (article) {
            document.body.removeChild(article);
        }
    }

    function select(selector) {
        deleteReader();
        if (selector && selector.length) {
            const selectors = parse(selector);
            const timeout = 10;
            setTimeout(() => {
                new Nodes([])
                    .get(selectors)
                    .injectArticle()
            }, timeout);
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
        onInitHost,
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

    chrome.runtime.onMessage.addListener(
        (req, sender, sendResponse) => {
            // console.log({req});
            initActions(req, sendResponse);
        });

        await chrome.runtime.sendMessage({
            request: 'initHost',
            client: 'content'
        });
})();
