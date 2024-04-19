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

function _createToggleButton(caption, initial, cb) {
    const button = createButton(caption.replace(/_/g, ' '), {
        top: '60px'
    }, cb);
    document.body.appendChild(button);
    if (initial !== 'false') {
        setTimeout(cb, 1000);
    }
}

export {_createToggleButton}
