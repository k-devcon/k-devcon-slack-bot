import admin from "firebase-admin";
import serviceAccount from "../../k-devcon-firebase-adminsdk-private-key.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://k-devcon-default-rtdb.firebaseio.com",
});

const db = admin.database();

export { db };
