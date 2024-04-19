function createButton(caption, style, clickhandler) {
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.right = '10px';
    button.style.zIndex = '999';
    for (const key of Object.keys(style)) {
        button.style[key] = style[key];
    }
    button.textContent = caption;
    button.onclick = clickhandler;
    return button;
}

function toggleElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        console.log('*** ', element.style.display)
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

function createToggleButton(caption, selector, initial) {
    const button = createButton(caption, {
        top: '60px'
    }, () => {
        toggleElement(selector);
    });
    document.body.appendChild(button);
    console.log('*** ', initial);
    if (initial !== 'false') {
        setTimeout(() => {
            toggleElement(selector);
        }, 1000);
    }
}

function decomment(s) {
    return s.replace('/* ', '').replace(' */', '').trim();
}

function parseFunction(line) {
    // console.log(line) // /* @toggle sidebar #sidebar false */
    const declaration = decomment(line);
    const w = declaration.split(' ');
    if (w.length !== 4) {
        console.error('*** wrong function declaration in style');
        return;
    }
    if (w[0] === '@toggle') {
        // console.log('*** caption', w[1]);
        createToggleButton(w[1], w[2], w[3]);
    }
}

function parseFunctionInStyle(style) {
    const lines = style.split('\n');
    for (const line of lines) {
        if (line.startsWith('/* @')) {
            parseFunction(line);
        }
    }
}

export {parseFunctionInStyle}
