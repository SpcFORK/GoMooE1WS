const { bpws } = require("./bpws/index");
const express = require("express");

const Frontend = import("./front/index.mjs");

const app = express();

app.get("/", (req, res) => {
  const scripts = [Frontend];

  const rq_PL = {
    reqHeaders: req.headers,
    reqUrl: req.url,
    reqQuery: req.query,
    reqBody: req.body,
    reqCookies: req.cookies,
    reqParams: req.params,
    reqMethod: req.method,
    reqIp: req.ip,
    reqProtocol: req.protocol,
    reqHostname: req.hostname,
    reqSubdomains: req.subdomains,
    reqSecure: req.secure,
  };

  const scriptPayloads = scripts.map((s) =>
    bpws.moduleToIIFE(s, JSON.stringify(rq_PL)),
  );

  Promise.all(scriptPayloads).then((sarr) => {
    console.log(sarr);
    bpws.sendBP_HTML(res, "Testing, testing, 123", ...sarr);
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
