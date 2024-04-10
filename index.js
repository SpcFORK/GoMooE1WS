const { bpws } = require("./bpws/index");
const express = require("express");

const Frontend = import("./front/Entry.mjs");

const app = express();
app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

const scripts = [Frontend];
const thtml = `

I am a super small test page.

`

app.get("/", (req, res) => {

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
    bpws.sendBP_HTML(res, '', thtml, ...sarr);
  });
});

app.get('/def', (req, res) => {
  res.send(thtml)
})

app.use(express.static("front"));
app.use(express.static("./bpws/bp-gm1/w"));

// ---

app.listen(3000, () => {
  console.log("Server started on port 3000");
});