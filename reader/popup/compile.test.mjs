import {compile} from './compile.mjs';
/*
@media (min-width: 1024px) {
    .css-1ygdjhk {
        margin-left: -15px;
        margin-right: 0;
        width: 500px;
        max-width: initial;
    }
}

 */
const scss = `
#readerarticle {
    background-color: #666;
    box-shadow: 0 6px 12px 3px rgba(0, 0, 0, 0.24);
    a {
        color: rgb(90, 200, 250) !important;
        text-decoration: none;
        border-bottom: none !important;
    } 
    * {
        color: rgba(255, 255, 255, 0.780392);
        background-color: #666;
    }
    aside * {
        color: inherit;
    }
} 
.content-container {
    background-color: #555;
}
html.article-page {
    background-color: #333333;
}
    `;

const css = compile(scss);
console.log(css);

