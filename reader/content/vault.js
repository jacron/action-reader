const styleVault = {
    stylesheet: {
        selector: 'link[rel=stylesheet]',
        elements: []
    },
    preload: {
        selector: 'link[rel=preload]',
        elements: []
    },
    preconnect: {
        selector: 'link[rel=preconnect]',
        elements: []
    },
    style: {
        selector: 'style',
        elements: []
    },
    script: {
        selector: 'script',
        elements: []
    }
}

function headToVault() {
    for (const key in styleVault) {
        const vault = styleVault[key];
        const elements = document.head.querySelectorAll(vault.selector);
        vault.elements = [];
        for (const element of elements) {
            vault.elements.push(element);
            document.head.removeChild(element);
        }
    }
}

function vaultToHead() {
    for (const key in styleVault) {
        for (const element of styleVault[key].elements) {
            document.head.appendChild(element);
        }
    }
}

export {headToVault, vaultToHead}
