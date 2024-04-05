const { bpws } = require("./bpws/index");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  bpws.sendBP_HTML(res, "Testing, testing, 123");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
})