const bp = require("./bp-gm1/bp");
const fs = require("fs");
const path = require("path");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
const moduleToIIFE = (m, _) => {
  if (m?.then) {
    return m.then((nm) => moduleToIIFE(nm, _));
  }
  //
  else if (typeof m === "function") {
    return functionToIIFE(m, _);
  }
  //
  else if (typeof m === "object" && typeof m?.default === "function") {
    return functionToIIFE(m.default, _);
  }
  //
  else if (typeof m?.WebEntry === "function") {
    return functionToIIFE(m.WebEntry, _);
  }
  //
  else throw new Error("Unknown module type");
};

// ---
// @Web

function w_JSHTMLUnpack(encodedHTML) {
  const dobj = GoMooE1.decode(encodedHTML),
    str = dobj.decodedString;

  window.GM1Client = {
    decodedObject: dobj,
    decodedString: str,
  };

  addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML = str;
  });
}

// ---

function makeDocument(head = "", body = "") {
  return new JSDOM(
    `<!DOCTYPE html><html><head>\n${head}\n</head><body>\n${body}\n</body></html>`,
  );
}

function sendBP_HTML(res, html, ...functionScripts) {
  const allScripts = functionScripts
      .map(
        (s) =>
          `\n<script>${typeof s === "string" ? s : functionToIIFE(s)}</script>`,
      )
      .join(""),
    compHTML = bp.encode(allScripts + "\n\n" + html),
    unpacker = functionToIIFE(w_JSHTMLUnpack, `'${compHTML.encodedString}'`),
    dom = makeDocument(`<script>${BP_HOOKIN(unpacker1)}</script>` + allScripts);

  return res.send(dom.serialize());
}

// ---

module.exports = {
  BP_HOOKIN,

  BP_SRC,
  BP_HOOKIN,
  w_JSHTMLUnpack,
  makeDocument,
  sendBP_HTML,

  functionToIIFE,
  codeToIIFE,
  moduleToIIFE,

  bp,
};
