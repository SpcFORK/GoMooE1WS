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

function makeCommentBlock(header, body, hasFooter = false) {
  const bodyHTML = body
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

  const makeCommentTagline = (name, h) =>
    `<!-- ${hasFooter ? `${name} OF ` : ""}${h} -->`;

  const commentHead = makeCommentTagline("START", header);
  const commentFoot = hasFooter ? makeCommentTagline("END", header) : "";

  return `${commentHead}\n${bodyHTML}\n${commentFoot}`;
}

// ---
// @Web

// @Deps
function BP_appendComment(container, text) {
  return container.appendChild(document.createComment(text));
}

function w_headProcessCleanup(name) {
  const scriptTag = document.querySelector("script[id=BPWS-SRC]");

  if (scriptTag)
    scriptTag.replaceWith(document.createComment(" BPWS_SOURCECODE_HIDDEN "));

  function deleteUneededTags(container) {
    container.innerHTML = container.innerHTML.replace(
      /(START OF (BP([^-]+){2})([^]+)END OF \2)/g,
      "BPWS_DEPACKED ",
    );
  }

  [document.body, document.head].map(deleteUneededTags);
}

// @Core
function w_JSHTMLUnpack(encodedHTML) {
  const dobj = GoMooE1.decode(encodedHTML),
    str = dobj.decodedString;

  window.GM1Client = {
    ...(window.GM1Client || {}),

    decodedObject: dobj,
    decodedString: str,
  };

  addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML = str;
  });
}

function w_makeResults(results) {
  window.GM1Client = {
    serverToPeer: results,
  };
}

function w_runScriptTagInvoker() {
  const scriptTags = document.querySelectorAll("script");

  const cBlockName = "BPWS_INVOKER_LOAD";

  BP_appendComment(document.head, `START OF ${cBlockName}`);

  for (const scriptTag of scriptTags) {
    if (scriptTag.dataset?.bpwsinvoker === "0") {
      const { innerHTML } = scriptTag;
      scriptTag.remove();

      const script = document.createElement("script");
      script.innerHTML = innerHTML;
      script.dataset.bpwsinvoker = "1";

      BP_appendComment(document.head, "BPWS_INVOKER_ITEM");
      document.head.appendChild(script);
    }
  }

  BP_appendComment(document.head, `END OF ${cBlockName}`);
}

// ---

function makeDocument(head = "", body = "") {
  return new JSDOM(
    `<!DOCTYPE html><html>\n<head>\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>`,
  );
}

function packWModule(mod) {
  const modStr = typeof mod === "string" ? mod : functionToIIFE(s);
  return `<script>${modStr}</script>`;
}

function packWModules(...mods) {
  return mods.map(packWModule).join("\n");
}

function packScriptTagInvoker(...scripts) {
  const scriptTags = packWModules(...scripts);
  const encodedScripts = bp.base64.encode(scriptTags);

  function unpackSI(scripts) {
    const encodedScripts = base64.decode(scripts);

    const doc = new DOMParser().parseFromString(encodedScripts, "text/html");
    const vHead = doc.querySelector("head");

    const cBlockName = "BP_SCRIPT_TAG_INVOKER";

    BP_appendComment(document.head, `START OF ${cBlockName}`);

    for (const child of vHead.children) {
      const script = document.createElement("script");
      script.innerHTML = child.innerHTML;
      document.head.appendChild(script);
    }

    BP_appendComment(document.head, `END OF ${cBlockName}`);
  }

  return makeCommentBlock(
    "BPWS_SCRIPT_TAG_INVOKER_PRE",
    [
      `<script data-bpwsinvoker="0">`,
      functionToIIFE(unpackSI, `"${encodedScripts}"`),
      `</script>`,
    ].join("\n"),
    true,
  );
}

function sendBP_HTML(res, head, html, ...functionScripts) {
  const allScripts = packScriptTagInvoker(...functionScripts),
    compHTML = bp.encode(allScripts + "\n\n" + html),
    unpacker = functionToIIFE(w_JSHTMLUnpack, `'${compHTML.encodedString}'`);

  const safeCompResult = Object.assign({}, compHTML);

  delete safeCompResult.uriString;

  // ---
  // @ Pass the UnpackerArchive to the client

  const deps = [BP_appendComment];

  const dependandFunctions = makeCommentBlock(
    "BPWS_DEPENDANT_FUNCTIONS",
    [`<script>`, ...deps, `</script>`].join("\n"),
    true,
  );

  const htmlUnpacker = makeCommentBlock(
    "BPWS_HTML_UNPACKER",
    [
      `<script>${functionToIIFE(w_makeResults, JSON.stringify(safeCompResult))}</script>`,
      `<script>${BP_HOOKIN(unpacker)}</script>`,
    ].join("\n"),
  );

  const scriptLoader = makeCommentBlock(
    "BPWS_SCRIPT_LOADER",
    [
      `<script>`,
      w_runScriptTagInvoker,
      w_headProcessCleanup,
      `addEventListener('DOMContentLoaded', w_runScriptTagInvoker)`,
      `addEventListener('DOMContentLoaded', w_headProcessCleanup)`,
      `</script>`,
    ].join("\n"),
  );

  const builtSMpl = [dependandFunctions, htmlUnpacker, scriptLoader].join("\n");

  const scriptRoot = makeCommentBlock("BP_UNPACKER_ARCHIVE", builtSMpl, true);

  const dom = makeDocument(head, scriptRoot);

  // ---

  return [res.send(dom.serialize()), compHTML, (dom.window.close(), true)];
}

// ---

module.exports = {
  // @ COMPRESSION
  BP_HOOKIN,

  BP_SRC,
  BP_HOOKIN,
  w_JSHTMLUnpack,
  makeDocument,
  sendBP_HTML,
  // ---

  // @ JS-CORE
  functionToIIFE,
  codeToIIFE,
  moduleToIIFE,

  packWModules,
  packWModule,
  packScriptTagInvoker,
  // ---

  // @ TOOLING
  makeCommentBlock,
  // ---

  bp,
};
