const port = chrome.runtime.connect({name: 'scanning'});

function scanDom(e) {
    const elements = document.elementsFromPoint(e.x, e.y);
    console.dir(elements);
    // chrome.runtime.sendMessage({feedback: elements}, res => {
    //     console.log(res);
    // }) // levert lege objecten
    // chrome.extension.sendRequest({element: elements[0]}); // doet niks
    // port.postMessage({element: elements[0]}); // levert leeg object
    const div = document.createElement('div');
    const ul = document.createElement('ul');
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        let li = document.createElement('li');
        li.innerText = `${i}: ${el.tagName} class="${el.className}" id="${el.id}"`;
        ul.appendChild(li);
    }
    div.appendChild(ul);
    document.body.appendChild(div);

    const style = {
        position: 'absolute',
        top: '100px',
        left: '100px',
        backgroundColor: '#fff',
        zIndex: '999999999999999999999',
        textAlign: 'left'
    };
    for ([key, value] of Object.entries(style)) {
        div.style[key] = value;
    }
}

document.addEventListener('click', scanDom);
