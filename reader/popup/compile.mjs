function prev(s, i) {
    // terug naar wat volgt op '}' of ';'
    while (i > 0 && s[i] !== '}' && s[i] !== ';') i--;
    return i + 1;
}
function skipNested(s) {
    let start = 0;
    let lines = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i] === ';') {
            lines.push(s.substr(start, i - start));
        }
        if (s[i] === '}') {
            start = i + 1;
        }
    }
    return lines.join(';');
}

function lastChar(s) {
    return s.substr(s.length - 1, 1);
}

function normLine(line) {
    return line.trim();
    // const last = lastChar(line);
    // if (line.length > 0 && '{};,'.indexOf(last) === -1) {
    //     return line.trim() + ';';
    // } else {
    //     return line.trim();
    // }
}

function stripComment(s) {
    let t = '';
    let commenting = false;
    let linecommenting = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '/' && i < s.length - 1 && s[i + 1] === '*') {
            commenting = true;
            i++;
        } else if (ch === '*' && i < s.length - 1 && s[i + 1] === '/') {
            commenting = false;
            i++;
        } else if (ch === '/' && i < s.length - 1 && s[i + 1] === '/') {
            linecommenting = true;
            i++;
        } else if (linecommenting && ch === '\n') {
            linecommenting = false;
            t += ch;
        }
        else if (!linecommenting && !commenting) {
            t += ch;
        }
    }
    return t;
}

function normalize(scss) {
    const lines1 = scss.split('\n');
    // console.log(lines1[0]);
    if (lines1[0] !== '// compile') {
        return null;
    }
    scss = stripComment(scss);
    const lines = scss.split('\n');
    const n = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        n.push(normLine(line));
    }
    return n.join('\n').replace(/\n/g, '');
}

function getElements(css) {
    let blocknesting = 0;
    let identifier = new Array(2);
    let body = new Array(2);
    let start = new Array(2);
    start[0] = 0;
    body[0] = '';
    body[1] = '';
    let elements = {};
    let nested = [];
    function openBlock(i) {
        blocknesting++;
        if (blocknesting === 1) {
            identifier[0] = css.substr(start[0], i - start[0]);
        }
        if (blocknesting === 2) {
            const p = prev(css, i - 1);
            identifier[1] = css.substr(p, i - p);
        }
    }
    function closeBlock(i) {
        blocknesting--;
        if (blocknesting === 0) {
            if (nested.length > 0) {
                for (let n of nested) {
                    const entries = Object.entries(n);
                    const id = identifier[0].trim() + ' ' + entries[0][0];
                    elements[id] = entries[0][1];
                }
                nested = [];
                const normalLines = skipNested(body[0]);
                if (normalLines.length > 0) {
                    elements[identifier[0]] = normalLines;
                }
            } else {
                elements[identifier[0]] = body[0];
            }
            body[0] = '';
            start[0] = i + 1;
        }
        if (blocknesting === 1) {
            const n = {};
            n[identifier[1]] = body[1];
            nested.push(n);
            body[1] = '';
        }
    }
    for (let i = 0; i < css.length; i++) {
        const ch = css[i];
        if (ch === '{') {
            openBlock(i);
        } else if (ch === '}') {
            closeBlock(i);
        }
        if (blocknesting > 0 && ch !== '{') {
            body[blocknesting - 1] += ch;
        }
    }
    return elements;
}

function getText(elements) {
    let text = '';
    for (let prop in elements) {
        if (elements.hasOwnProperty(prop)) {
            text += prop.replace(',', ',\n') + '{\n';
            const lines = elements[prop].split(';');
            for (let line of lines) {
                if (line.length > 0) {
                    text += '    ' + line + ';\n';
                }
            }
            text += '}\n';
        }
    }
    return text;
}

export function compile(scss) {
    let css = normalize(scss);
    if (css === null) {
        return scss;  // do not compile
    } else {
        const elements = getElements(css);
        return getText(elements);
    }
}

// export {compile}
