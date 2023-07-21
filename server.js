const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const app = express();
const port = 3000;
const mongoUrl = "mongodb://localhost:27017/ShortenURLDatabase";
const baseUrl = "http://localhost:3000/";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const urlSchema = new mongoose.Schema({
  shortUrl: String,
  destinationUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model("Url", urlSchema);
app.use(bodyParser.urlencoded({ extended: true }));

function generateShortUrl() {
  return nanoid(8);
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/shorten", async (req, res) => {
  const destinationUrl = req.body.url;
  const shortUrl = generateShortUrl();
  const shortenedUrl = baseUrl + shortUrl;
  await Url.create({ shortUrl, destinationUrl });
  res.send(
    `<h1>URL Shortened Successfully!</h1><p>Shortened URL: <a href="${shortenedUrl}">${shortenedUrl}</a></p>`
  );
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const url = await Url.findOne({ shortUrl });
  if (url) {
    res.redirect(url.destinationUrl);
  } else {
    res.status(404).send("<h1>URL Not Found</h1>");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
