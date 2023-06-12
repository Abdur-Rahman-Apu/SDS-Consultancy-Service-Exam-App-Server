const express = require("express");
const app = express();

const cors = require("cors");
const util = require("node:util");
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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uq4fq8s.mongodb.net/?retryWrites=true&w=majority`;

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

  //get only employees data
  app.get("/onlyEmployees", async (req, res) => {
    const cursor = employeesCollection.find({});
    const result = await cursor.toArray();
    const onlyEmployeesData = result.filter(
      (employee) => employee.role !== "admin"
    );
    res.send(onlyEmployeesData);
  });

  // get certification data
  app.get("/certifications", async (req, res) => {
    const cursor = certificationsCollection.find({});
    const result = await cursor.toArray();
    res.send(result);
  });

  // get specific course
  app.get("/certifications/:courseName", async (req, res) => {
    const query = req.params;
    const result = await certificationsCollection.findOne(query);
    res.send(result);
  });

  //get specific employee
  app.get("/onlySpecificEmployee", async (req, res) => {
    const id = req.query.id;
    const filter = { _id: new ObjectId(id) };
    const result = await employeesCollection.findOne(filter);

    res.send(result);
  });

  // Api which is needed for admin

  // update admin password
  app.patch("/updateAdminPassword", async (req, res) => {
    const id = req.query;

    const query = { _id: new ObjectId(id) };

    const newPassword = req.body.password;

    const updateDoc = {
      $set: {
        password: newPassword,
      },
    };

    const result = await employeesCollection.updateOne(query, updateDoc);

    res.send(result);
  });

  // add a new employee
  app.post("/addEmployee", async (req, res) => {
    const query = req.body;
    const result = await employeesCollection.insertOne(query);
    res.send(result);
  });

  // delete an employee

  app.delete("/deleteEmployee", async (req, res) => {
    const id = req.query.id;
    const query = { _id: new ObjectId(id) };
    const result = await employeesCollection.deleteOne(query);
    res.send(result);
  });

  // add question in to the specific course
  app.patch("/addQuestion", async (req, res) => {
    const filter = req.query.courseName;
    const question = req.body;

    const findCourse = await certificationsCollection.findOne({
      courseName: filter,
    });

    findCourse.questionPaper = [];

    console.log(findCourse.questionPaper);

    question.forEach((item) => {
      const pi = JSON.parse(item);

      findCourse.questionPaper.push(pi);
    });

    console.log(findCourse.questionPaper.length);

    const result = await certificationsCollection.replaceOne(
      { courseName: filter },
      findCourse
    );

    res.send(result);
  });

  // update employees registration id
  app.patch("/updateEmployeeId", async (req, res) => {
    const id = req.query.id;
    const filter = { _id: new ObjectId(id) };
    const newRegId = req.body.newId;
    const updateDoc = {
      $set: {
        regId: newRegId,
      },
    };
    const result = await employeesCollection.updateOne(filter, updateDoc);
    res.send(result);
  });

  // store employees result
  app.patch("/userResult", async (req, res) => {
    if (req.body.totalMark >= 0) {
      const id = req.query.id;
      const markData = req.body;

      const filter = { _id: new ObjectId(id) };

      const specificEmployee = await employeesCollection.findOne(filter);

      const courseName = markData.courseName;

      specificEmployee.result[`${courseName}`].unshift(markData);

      const replacement = {
        ...specificEmployee,
      };

      const result = await employeesCollection.replaceOne(filter, replacement);

      res.send(result);
    }
  });
}
run().catch((err) => {
  console.log(err);
});
