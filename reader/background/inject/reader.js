/*
 * this script is injected
 * (not a part of the moldule)
 */

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
            const clone = nodes[i].cloneNode(true);
            article.appendChild(clone);
        }
        container.appendChild(article);
        container.id = 'readercontainer';
        return container;
    }

    function getNodes(sel) {
        let nodes = null;
        if (Array.isArray(sel)) {
            for (let j = 0; j < sel.length; j++) {
                nodes = document.querySelectorAll(sel[j]);
                if (nodes) break;
            }
        } else if (sel) {
            nodes = document.querySelectorAll(sel);
        }
        return nodes;
    }

    this.get = selector => {
        for (let i = 0; i < selector.length; i++) {
            let sel = selector[i];
            let optional = false;
            if (sel[0] === '@') {
                sel = sel.substr(1);
                optional = true;
            }
            const node = getNodes(sel);
            // console.log(sel, node);
            if (node && node.length > 0) {
                for (let k = 0; k < node.length; k++) {
                    nodes.push(node[k]);
                }
            } else {
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
            const div = document.createElement('div');
            div.appendChild(container);
            // document.body.appendChild(container);
            // console.log('container', container);
            document.body.innerHTML = div.innerHTML;
            document.getElementById('readerarticle').className = 'dark';
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

function themeSite(selector) {
    deleteReader();
    if (selector && selector.length) {
        const selectors = parse(selector);
        console.log('selectors', selectors);
        new Nodes([])
            .get(selectors)
            .injectArticle()
    }
}

console.log('injected script loaded');
