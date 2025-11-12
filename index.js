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
    const reviewCollection = db.collection("review");
    const favoritesCollection = db.collection("MyFavorites");
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
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
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
    app.get("/foods", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });
    // review section

    app.post("/add-review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    //     app.get("/review", (req, res) => {
    //   const email = req.query.email;
    //   const search = req.query.search;
    //   const query = {};

    //   if (email) {
    //     query.email = email;
    //   }

    //   if (search) {
    //     query.foodName = { $regex: search, $options: "i" };
    //   }

    //   reviewCollection
    //     .find(query)
    //     .sort({ createdAt: -1 })
    //     .toArray()
    //     .then(result => res.send(result))
    //     .catch(err => {
    //       console.error(err);
    //       res.status(500).send({ message: "Server Error" });
    //     });
    // });

    app.get("/review", async (req, res) => {
      const email = req.query.email;
      const search = req.query.search;
      const query = {};

      if (email) {
        query.email = email;
      }

      if (search) {
        // Search by foodName (case-insensitive)
        query.foodName = { $regex: search, $options: "i" };
      }

      const cursor = reviewCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;
      const query = { _id: new ObjectId(id) };

      const update = {
        $set: {
          foodName: updatedReview.foodName,
          foodImage: updatedReview.foodImage,
          restaurantName: updatedReview.restaurantName,
        },
      };

      const result = await reviewCollection.updateOne(query, update);
      res.send(result);
    });
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    // POST /my-favorites
    app.post("/my-favorites", async (req, res) => {
      try {
        const { email, foodId, foodName, foodImage, restaurantName } = req.body;

        // 🧩 Validation
        if (!email || !foodId) {
          return res.status(400).send({
            success: false,
            message: "Email and foodId are required",
          });
        }

        // 🔍 Duplicate check (same user can't favorite same food twice)
        const exists = await favoritesCollection.findOne({ email, foodId });
        if (exists) {
          return res.status(400).send({
            success: false,
            message: "Already added to favorites",
          });
        }

        // 📝 Prepare new favorite document
        const newFavorite = {
          email,
          foodId,
          foodName,
          foodImage,
          restaurantName,
          createdAt: new Date(),
        };

        // 💾 Insert into MongoDB
        const result = await favoritesCollection.insertOne(newFavorite);

        // ✅ Success response
        res.send({
          success: true,
          message: "Added to favorites",
          result,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          success: false,
          message: "Failed to add favorite",
        });
      }
    });
    // GET /my-favorites?email=user@example.com
    app.get("/my-favorites", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res
            .status(400)
            .send({ success: false, message: "Email is required" });
        }
        const cursor = favoritesCollection
          .find({ email })
          .sort({ createdAt: -1 });
        const favorites = await cursor.toArray();

        res.send({ success: true, favorites });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch favorites" });
      }
    });
    // delete for my favorites
    app.delete("/my-favorites/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid ID format" });
      }
      const result = await favoritesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .send({ success: false, message: "Favorite not found" });
      }
      res.send({ success: true, message: "Removed from favorites" });
    });

    // Assuming MongoDB with foods collection

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
