function bind(type, bindings) {
    for (const [id, listener] of bindings) {
        const element = document.getElementById(id);
        if (!element) {
            console.error('id does not exist', id);
        } else {
            element.addEventListener(type, listener);
        }
    }
}

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

export {bind, getJcReaderHost}
