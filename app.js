import { MongoClient } from "mongodb";

const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";

const client = new MongoClient(uri);

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

const iconsCache = {
  mdi: [],
  fa: [],
  linea_basic: [],
};

const server = Bun.serve({
  port,
  async fetch(req) {
    const { searchParams, pathname } = new URL(req.url);
    if (
      req.method === "GET" &&
      pathname === "/icons" &&
      searchParams.get("prefix")
    ) {
      const icons = await getIconsByPrefix(
        searchParams.get("prefix"),
        iconsCache
      );
      return new Response(JSON.stringify(icons), CORS_HEADERS);
    } else if (req.method == "GET" && pathname == "/distinctIconPrefixes") {
      const prefixes = await getDistinctIconPrefixes();
      return new Response(JSON.stringify(prefixes), CORS_HEADERS);
    }

    return new Response("Method not handled");
  },
});

console.log(`Listening on localhost:${server.port}`);

async function getDistinctIconPrefixes() {
  const iconsCollection = client.db("AEIconManager").collection("Icons");
  return await iconsCollection.distinct("prefix");
}

async function getIconsByPrefix(prefix, iconsCache) {
  if (!prefix) return [];
  if (iconsCache && iconsCache[prefix].length > 0) return iconsCache[prefix];
  console.log("icons in cache", icons);

  const iconsCollection = client.db("AEIconManager").collection("Icons");
  var icons = iconsCollection.find({ prefix: prefix });

  var manipulatedIcons = [];
  for await (const icon of icons) {
    manipulatedIcons.push(icon);
  }
  iconsCache[prefix] = manipulatedIcons;
  return manipulatedIcons;
}

// async function updateNewDB(icons) {
//   if (!icons || icons.length === 0) return;

//   const pb = new PocketBase("https://pocketbase.aehm.cloud");
//   const record = await pb
//     .collection("icons")
//     .getFirstListItem(`prefix="${icons[0].prefix}"`);

//   if (record) return;

//   icons.forEach(icon => {
//     const data = {
//       "image": icon.image,
//       "path": icon.path,
//       "prefix": icon.prefix,
//       "name": icon.name,
//     };

//     pb.collection('icons').create(data);
//   });
// }
