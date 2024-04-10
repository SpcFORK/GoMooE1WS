const { bpws } = require("./bpws/index");
const express = require("express");

const app = express();

function Main() {
  console.log(1)
}

app.get("/", (req, res) => {
  const scripts = [
    Main
  ]
  
  bpws.sendBP_HTML(res, "Testing, testing, 123", ...scripts);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
})