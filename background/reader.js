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

const Nodes = function(nodes) {
    this.get = selector => {
        for (let i = 0; i < selector.length; i++) {
            let sel = selector[i];
            let optional = false;
            if (sel[0] === '@') {
                sel = sel.substr(1);
                optional = true;
            }
            let node = null;
            if (Array.isArray(sel)) {
                for (let j = 0; j < sel.length; j++) {
                    node = document.querySelector(sel[j]);
                    if (node) break;
                }
            } else if (sel) {
                node = document.querySelector(sel);
            }
            if (node) {
                nodes.push(node);
            } else {
                console.log(sel + ' is not a node');
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
            document.body.appendChild(container);
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
        new Nodes([])
            .get(selector)
            .injectArticle()
    }
}

console.log('injected script loaded');
