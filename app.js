const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

app.get("/icons", (req, res) => {
  const prefix = req.query.prefix;
  if (prefix) {
    getIconsByPrefix(prefix)
      .then((icons) => {
        res.send(icons);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    res.status(400).send("Missing prefix query parameter");
  }
});

app.get("/distinctIconPrefixes", (req, res) => {
  getDistinctIconPrefixes()
    .then((prefixes) => {
      res.send(prefixes);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function getDistinctIconPrefixes() {
  const iconsCollection = client.db("AEIconManager").collection("Icons");
  return await iconsCollection.distinct("prefix");
}

async function getIconsByPrefix(prefix) {
  const iconsCollection = client.db("AEIconManager").collection("Icons");
  var icons = await iconsCollection.find({ prefix: prefix });

  var manipulatedIcons = [];
  for await (const icon of icons) {
    var image = encodeURIComponent(
      icon.image.replace("<path ", `<path style="fill:#FFFFFF" `)
    );
    icon.imagePath = `data:image/svg+xml,${image}`;
    manipulatedIcons.push(icon);
  }
  return manipulatedIcons;
}
