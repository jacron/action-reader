function createButton(caption, style, clickhandler) {
    const button = document.createElement('button');
    for (const key of Object.keys(style)) {
        button.style[key] = style[key];
    }
    button.textContent = caption;
    button.onclick = clickhandler;
    return button;
}

function toggleInvert(button) {
    if (button.style.filter === 'invert(1)') {
        button.style.filter = 'none';
    } else {
        button.style.filter = 'invert(1)'
    }
}

function _createToggleButton(caption, initial, cb) {
    const button = createButton(caption.replace(/_/g, ' '), {
        top: '60px',
        position: 'fixed',
        right: '10px',
        zIndex: '9999999999',
        filter: 'invert(1)'
    }, () => {
        cb();
        toggleInvert(button);
    });
    document.body.appendChild(button);
    if (initial !== 'false') {
        setTimeout(() => {
            cb();
            toggleInvert(button);
        }, 1000);
    }
}

export {_createToggleButton}
