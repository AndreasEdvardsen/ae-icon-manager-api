require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";
const client = new MongoClient(uri);

if (!isProduction) {
  app.use(cors());
}

app.get("/icons", async (req, res) => {
  const prefix = req.query.prefix;
  if (!prefix) {
    return res.status(400).send("Missing prefix query parameter");
  }

  try {
    const icons = await getIconsByPrefix(prefix);
    res.send(icons);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/distinctIconPrefixes", async (req, res) => {
  try {
    const prefixes = await getDistinctIconPrefixes();
    res.send(prefixes);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`MONGODB_URI: ${uri}`);
});

async function getDistinctIconPrefixes() {
  const iconsCollection = client.db("AEIconManager").collection("Icons");
  return await iconsCollection.distinct("prefix");
}

async function getIconsByPrefix(prefix) {
  const iconsCollection = client.db("AEIconManager").collection("Icons");
  var icons = iconsCollection.find({ prefix: prefix });

  var manipulatedIcons = [];
  for await (const icon of icons) {
    manipulatedIcons.push(icon);
  }
  return manipulatedIcons;
}
