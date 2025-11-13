require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

//middleware
app.use(cors());

app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("propertyDB");
    const propertyCollection = db.collection("properties");
    const reviewCollection = db.collection("reviews");

    // get / read
    //all properties
    app.get("/properties", async (req, res) => {
      const {
      } = req.query;
      let query = {};
      let sortOptions = {};

      // Search functionality
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }


      // Sort functionality
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
      } else {
        // sort by createdAt descending (newest first)
        sortOptions.createdAt = -1;
      }

      const cursor = propertyCollection.find(query).sort(sortOptions);
      const result = await cursor.toArray();
      res.send(result);
    });

    //my properties (filtered by userEmail)
    app.get("/my-properties", async (req, res) => {
      const { userEmail } = req.query;
      if (!userEmail) {
        return res.status(400).send({ error: "userEmail is required" });
      }
      const query = { userEmail };
      const cursor = propertyCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //recent properties (newest first, limit 6)
    app.get("/recent-properties", async (req, res) => {
      const cursor = propertyCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    //single properties
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    });

    // create / post
    app.post("/properties", async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    // update / patch
    app.patch("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProperty = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProperty.name,
          description: updatedProperty.description,
          category: updatedProperty.category,
          price: updatedProperty.price,
          location: updatedProperty.location,
          image: updatedProperty.image,
        },
      };
      const result = await propertyCollection.updateOne(query, update);
      res.send(result);
    });

    // delete
    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.send(result);
    });

    // Reviews endpoints
    // Get reviews for a property
    app.get("/reviews/:propertyId", async (req, res) => {
      const { propertyId } = req.params;
      const query = { propertyId };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get reviews by user
    app.get("/my-reviews", async (req, res) => {
      const { userEmail } = req.query;
      if (!userEmail) {
        return res.status(400).send({ error: "userEmail is required" });
      }
      const query = { userEmail };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a review
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    // Delete a review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/", (req, res) => {
      res.send("Smart server is running");
    });

    app.listen(port, () => {
      console.log(`smart server is running on port: ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}
run();
