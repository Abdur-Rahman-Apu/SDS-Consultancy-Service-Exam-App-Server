const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
require("dotenv").config();

// test
app.get("/", async (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});

// mongodb

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uq4fq8s.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  // collections
  const employeesCollection = client.db("Exam").collection("Employees");
  const certificationsCollection = client
    .db("Exam")
    .collection("Certifications");

  //get employees data
  app.get("/employees", async (req, res) => {
    const cursor = employeesCollection.find({});
    const result = await cursor.toArray();
    res.send(result);
  });

  // get certification data
  app.get("/certifications", async (req, res) => {
    const cursor = certificationsCollection.find({});
    const result = await cursor.toArray();
    res.send(result);
  });
}
run().catch((err) => {
  console.log(err);
});
