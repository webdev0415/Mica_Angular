"use strict";

const path = require("path");
const express = require("express");
const app = express();

let host = "0.0.0.0",
  port = 8081;

app.use(express.static(path.resolve("dist")));

app.get("/ping", (req, res) => {
  return res
    .header("Content-Type", "text/plain")
    .status(200)
    .send("OK");
});

app.get("*", (request, response) => {
  response.sendFile(path.resolve("dist/MICA", "index.html"));
});

app.listen(port, host, () => (
  console.log(`Server listening on ${host}:${port}`)
));
