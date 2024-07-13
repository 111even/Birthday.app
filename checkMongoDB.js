const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function checkMongoDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB server");
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB is running");
    } catch (err) {
        console.error("MongoDB is not running", err);
    } finally {
        await client.close();
    }
}

checkMongoDB();
