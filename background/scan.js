// const port = chrome.runtime.connect({name: 'scanning'});

function createSpan(color, text) {
    const span = document.createElement('span');
    span.style.color = color;
    span.innerText = text;
    return span;
}

function scanDom(e) {
    const elements = document.elementsFromPoint(e.x, e.y);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id === 'elements-dump') { return }
    }

    console.dir(elements);
    const div = document.createElement('div');
    const ul = document.createElement('ul');
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        let li = document.createElement('li');
        li.appendChild(createSpan('#a89', i ));
        li.appendChild(createSpan('#eee', ':  '));
        if (el.tagName) {
            li.appendChild(createSpan('#489', el.tagName.toLowerCase()));
        }
        if (el.id) {
            li.appendChild(createSpan('#c93', '#' + el.id));
        }
        if (el.className) {
            li.appendChild(createSpan('#6ab', '.' + el.className.replace(/ /g, '.')))
        }
        ul.appendChild(li);
    }
    div.appendChild(ul);

    const style = {
        position: 'absolute',
        top: '100px',
        left: '100px',
        backgroundColor: '#222',
        zIndex: '999999999999999999999',
        textAlign: 'left',
        padding: '7px',
        fontSize: '14px',
        lineHeight: '1.4',
    };
    for ([key, value] of Object.entries(style)) {
        div.style[key] = value;
    }
    div.id = 'elements-dump';
    document.body.appendChild(div);
}

console.log('injected script loaded');
