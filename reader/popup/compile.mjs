/*
partial, light-weight implementation of a scss compiler
limitations:
- nesting not deeper than once
- no compiling of @media rules, these are passed through
- no variables
it permits:
- nesting (once)
- comma separated identifiers

 */
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

// function lastChar(s) {
//     return s.substr(s.length - 1, 1);
// }

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

function checkScssLine(scss) {
    const lines1 = scss.split('\n');
    return lines1[0] === '// scss';
}

function stripWhiteSpace(scss) {
    const lines = scss.split('\n');
    const n = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        n.push(normLine(line));
    }
    return n.join('\n')
        .replace(/\n/g, '');
}

function getIdfs(identifier0, idf) {
    let idfs = '';
    for (let i of idf.split(',')) {
        if (idfs.length > 0) {idfs += ',';}
        idfs += identifier0.trim() + ' ' + i.trim();
    }
    return idfs;
}

function getBody(nested, identifier0, body0, elements) {
    if (nested.length > 0) {
        for (let n of nested) {
            const [idf, body] = n;
            const idfs = getIdfs(identifier0, idf);
            elements[idfs] = body;
        }
        const normalLines = skipNested(body0);
        if (normalLines.length > 0) {
            elements[identifier0] = normalLines;
        }
    } else {
        elements[identifier0] = body0;
    }
}

function getMediaBlock(css, start) {
    let blocknesting = 0;
    let block = '';
    let i = start;
    for (; i < css.length; i++) {
        const ch = css[i];
        block += ch;
        if (ch === '{') { blocknesting++; }
        if (ch === '}') {
            blocknesting--;
            if (blocknesting === 0) { break; }
        }
    }
    return [i, block];
}

function getElements(css) {
    let blocknesting = 0;
    let identifier = new Array(2);
    let body = new Array(2);
    let start = new Array(2);
    let mediablocks = [];
    start[0] = 0;
    body[0] = '';
    body[1] = '';
    let elements = {};
    let nested = [];
    function openBlock(i) {
        blocknesting++;
        if (blocknesting === 1) {
            identifier[0] = css.substr(start[0], i - start[0]).trim();
        }
        if (blocknesting === 2) {
            const p = prev(css, i - 1);
            identifier[1] = css.substr(p, i - p).trim();
        }
    }
    function closeBlock(i) {
        blocknesting--;
        if (blocknesting === 0) {
            getBody(nested, identifier[0], body[0], elements);
            nested = [];
            body[0] = '';
            start[0] = i + 1;
        }
        if (blocknesting === 1) {
            nested.push([identifier[1], body[1]]);
            body[1] = '';
        }
    }
    for (let i = 0; i < css.length; i++) {
        let ch = css[i];
        if (ch === '{') {
            openBlock(i);
        } else if (ch === '}') {
            closeBlock(i);
        } else if (ch === '@') {
            const [j, block]  = getMediaBlock(css, i);
            i = j;
            mediablocks.push(block);
            body[0] = '';
            start[0] = i + 1;
        }
        if (blocknesting > 0 && ch !== '{') {
            body[blocknesting - 1] += ch;
        }
    }
    // console.log('mediablocks', mediablocks);
    return [elements, mediablocks];
}

function getText(elements) {
    let text = '';
    for (let prop in elements) {
        if (elements.hasOwnProperty(prop)) {
            text += prop.replace(',', ',\n') + ' {\n';
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
    if (checkScssLine(scss)) {
        scss = stripComment(scss);
        let css = stripWhiteSpace(scss);
        const [elements, mediablocks] = getElements(css);
        return getText(elements) + mediablocks.join('\n');
    } else {
        return scss;
    }
}
