const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uhbaknf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// connect with database
const dbConnect = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error(error);
  }
};
dbConnect();

// database collection;
const contactCollection = client.db("address_manager").collection("contacts");

app.post("/contacts", async (req, res) => {
  try {
    const { name, phone, email, image } = req.body;

    // Check if mobile number already exists in contacts collection
    const existingContact = await contactCollection.findOne({ phone });
    if (existingContact) {
      return res
        .status(409)
        .json({ message: "Mobile number already exists in contacts." });
    }

    // Insert new contact into contacts collection
    const result = await contactCollection.insertOne({
      name,
      phone,
      email,
      image,
    });
    res.send(result);
  } catch (error) {
    console.error(error);
  }
});
app.get("/contacts", async (req, res) => {
  try {
    const query = {};
    const contacts = await contactCollection
      .find(query)
      .sort({ name: 1 })
      .toArray();
    res.send(contacts);
  } catch (error) {}
});

app.delete("/contacts/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const deletedContact = await contactCollection.deleteOne(query);
    res.send(deletedContact);
  } catch (error) {
    res.send(error);
    console.error(error);
  }
});

app.put("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, image } = req.body;
  try {
    const result = await contactCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: { name, email, phone, image } }
    );
    if (result.modifiedCount === 1) {
      res.send(`User with ID ${id} updated successfully`);
    } else {
      res.status(404).send(`User with ID ${id} not found`);
    }
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// root api
app.get("/", (req, res) => {
  res.send("Address Manger Server is Running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
