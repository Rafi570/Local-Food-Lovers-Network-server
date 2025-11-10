const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
// index.js
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);
// const serviceAccount = require("./local-food.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lq5729d.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("assignment 10 running");
});
async function run() {
  try {
    // await client.connect();
    const db = client.db("Food_Server");
    const foodCollection = db.collection("Foods");
    const userCollection = db.collection("users");

    // users Api
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      }
      else{
        const result =await userCollection.insertOne(newUser)
        res.send(result)
      }
    });

    // Food Api
    app.get("/best-foods", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = foodCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/foods/:id',async(req,res)=>{
      const id = req.params.id
      const query ={_id: new ObjectId(id)}
      const result =await foodCollection.findOne(query)
      res.send(result)
    })
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
