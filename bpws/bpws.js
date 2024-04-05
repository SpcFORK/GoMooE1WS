const bp = require("./bp-gm1/bp");
const fs = require("fs");
const path = require("path");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("bpws.js");

// ---

const BP_SRC = () =>
  fs.readFileSync(path.join(__dirname, "./bp-gm1/w/index.js"), "utf8");

const BP_HOOKIN = (_) => `${BP_SRC()}

// ---
;/BP_HOOKIN/;
${_ + ""}
`;

// ---

const functionToIIFE = (code, _ = "") => `(${code})(${_});`;
const codeToIIFE = (code = "{}", _ = "") => functionToIIFE("_ => " + code, _);

// ---
// @Web

function w_JSHTMLUnpack(encodedHTML) {
  const 
    b = document.body,

    e = document.createElement("div"),
    str = GoMooE1.decode(encodedHTML).decodedString
  
  e.innerHTML = str;
  console.log(str);
  window.w_JSHTMLUnpack = e;

  console.log(e);
}

// ---

function makeDocument(head = "", body = "") {
  return new JSDOM(
    `<!DOCTYPE html><html><head>\n${head}\n</head><body>\n${body}\n</body></html>`,
  );
}

function sendBP_HTML(res, html) {
  const compHTML = bp.encode(html);

  const unpacker = functionToIIFE(w_JSHTMLUnpack, `'${compHTML.encodedString}'`);

  const dom = makeDocument(`<script>${BP_HOOKIN(unpacker)}</script>`);

  return res.send(dom.serialize());
}

// ---

module.exports = {
  bp,
  BP_HOOKIN,

  BP_SRC,
  BP_HOOKIN,
  w_JSHTMLUnpack,
  makeDocument,
  sendBP_HTML,
};
