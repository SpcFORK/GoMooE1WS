const { bpws } = require("./bpws/index");
const express = require("express");

const Frontend = import("./front/Entry.mjs");

const app = express();
const scripts = [Frontend];
const thtml = `
THE RISE OF ETHICAL CONSUMERISM
When you envision a better world. What pops into mind? 

Whether it’s equal opportunities, clean rivers, or health benefits – The consumer now understands that every buck you spend is like casting a ballot. 

You’re voting for the kind of world you want to live in when you support a business. Because when you support a business you support the way they do business. 

If you want to guarantee workers safe working conditions, for example – The answer has become relatively simple, you buy from businesses that share your values and maintain safe working conditions.
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
    bpws.sendBP_HTML(res, thtml, ...sarr);
  });
});

app.get('/def', (req, res) => {
  res.send(thtml)
})

app.use(express.static("front"));
app.use(express.static("./bpws/bp-gm1/w"));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
