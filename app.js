const { MongoClient, ServerApiVersion } = require("mongodb");
const PocketBase = require("pocketbase");
const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.MONGODB_URI) {
  return console.error("MONGODB_URI environment variable is required");
}

const client = new MongoClient(uri);

if (!isProduction) {
  app.use(cors());
} else {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
    })
  );
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
  updateNewDB(manipulatedIcons);
  return manipulatedIcons;
}

async function updateNewDB(icons) {
  if (!icons || icons.length === 0) return;

  const pb = new PocketBase("https://pocketbase.aehm.cloud");
  const record = await pb
    .collection("icons")
    .getFirstListItem(`prefix="${icons[0].prefix}"`);

  if (!record) return;

  icons.forEach(icon => {
    const data = {
      "image": icon.image,
      "path": icon.path,
      "prefix": icon.prefix,
      "name": icon.name,
    };

    pb.collection('icons').create(data);
  });
}
