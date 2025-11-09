const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://propertydb:0jVB8tDRmK1eU6bS@usersdb.faiyd0c.mongodb.net/?appName=usersdb";

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
    await client.connect();

    const db = client.db("propertyDB");
    const propertyCollection = db.collection("properties");

    // get / read
    //all properties
    app.get("/properties", async (req, res) => {
      const cursor = propertyCollection.find();
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
          price: updatedProperty.price,
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
