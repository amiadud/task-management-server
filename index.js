const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;

//dot environment config
require('dotenv').config()

//middlewares
app.use(express.json());
app.use(cors({
    origin: [
    "http://localhost:5173",
    "https://task-management-one-sepia.vercel.app"
  ],
    credentials:true
  }));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.35itrev.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const taskCollection = client.db("TaskManagement").collection("tasks");

    app.get('/', (req, res) => {
        res.send('Welcome to my server')
        })
    
    app.post('/tasks',async (req, res) => {
    const newTask = req.body;
    await taskCollection.insertOne(newTask);
    res.send(newTask);
    });


    app.get('/tasks', async (req, res) => {
      try {
        const email = req.query.email
        const query = {email: email}
        const tasks = await taskCollection.find(query).toArray();
        res.send(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // find task details from database
    app.get("/task-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await taskCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    //update task 
    app.put('/task-details/:id', async(req, res) => {
       try{
      const id = req.params.id;
      const updateItem = req.body
      const filter = { _id: new ObjectId (id) }
      const updateDoc = {
        $set: {
          title: updateItem.title,
          description: updateItem.description,
          deadline: updateItem.deadline,
          priority: updateItem.priority,
        }
      }
    const result = await taskCollection.updateOne(filter, updateDoc )
    res.send( result);

  }catch(err){
      console.log(err.message);
  }
})
 
app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  try {
    const updatedTask = await taskCollection.findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { $set: req.body },
      { returnDocument: 'after' }
    );

    res.send(updatedTask.value);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

    app.delete('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      try {
        const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });
        res.send(result);
      } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })