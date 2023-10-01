const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const Realm = require("realm-web");
const realmApp = new Realm.App({ id: "data-lskup" });

var icons = [];

app.get("/icons", (req, res) => {
  res.send(icons);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function loginEmailPassword(email, password) {
  // Create an email/password credential
  const credentials = Realm.Credentials.emailPassword(email, password);
  // Authenticate the user
  const user = await realmApp.logIn(credentials);
  // 'App.currentUser' updates to match the logged in user
  console.assert(user.id === realmApp.currentUser.id);
  return user;
}

loginEmailPassword(process.env.USER_ID, process.env.USER_KEY).then((user) => {
  const mongo = realmApp.currentUser.mongoClient("AEProjects");
  const iconsCollection = mongo.db("AEIconManager").collection("Icons");

  iconsCollection
    .find({
      prefix: "mdi",
    })
    .then((results) => {
      results.forEach((icon) => {
        var image = encodeURIComponent(
          icon.image.replace("<path ", `<path style="fill:#FFFFFF" `)
        );
        icon.imagePath = `data:image/svg+xml,${image}`;
        icons.push(icon);
      });
    });
});
