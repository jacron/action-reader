function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

export {getJcReaderHost}
