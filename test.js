let s =
`.content__main
.content__head,.content_top, .content_tail
#main
`;
s = '/content__main-column';
/*
expected:
[
    ".content__main",
    [ ".content__head", ".content_top", ".content_tail ]",
    "#main"
]
 */
function parse(s) {
    let selector = [];
    let lines = s.split('\n');
    if (lines.length > 1) {
        for (let line of lines) {
            line = line.trim();
            let words = line.split(',');
            if (words.length > 1) {
                let selectorWords = [];
                for (let word of words) {
                    word = word.trim();
                    if (word.length > 0) {
                        selectorWords.push(word);
                    }
                }
                selector.push(selectorWords);
            } else {
                if (line.length > 0) {
                    selector.push(line);
                }
            }
        }
    } else {
        if (s.length > 0) {
            selector.push(s);
        }
    }
    return selector;
}

console.log(parse(s));
