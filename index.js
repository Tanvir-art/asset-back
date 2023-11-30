const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const  express = require('express');
const cors = require('cors');
const app = express();
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// asset_manager
// fhxAOasMlWK7eCyi
// app.use(cors())
// app.use(express.json())

const uri = "mongodb+srv://asset_manager:fhxAOasMlWK7eCyi@cluster0.crzw9rp.mongodb.net/?retryWrites=true&w=majority";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const employeCollection = client.db('assetManagement').collection('userEmployee');
    const hrCollection = client.db('assetManagement').collection('userAdmin');
    const assetCollection = client.db('assetManagement').collection('asset');
    const myEmployeeCollection = client.db('assetManagement').collection('myEmployee');
    const requestCollection = client.db('assetManagement').collection('request');
    const customRequestCollection = client.db('assetManagement').collection('customRequest');
    app.post('/employee', async(req, res)=>{
      const employee = req.body;
      const  query = {email:employee.email}
      const existingUser = await employeCollection.findOne(query);
      if(existingUser){
        return res.send({message: "user already exist"})
      }
      const result = await employeCollection.insertOne(employee);
      res.send(result)
    })

    app.get('/employee', async(req, res)=>{
      const result = await employeCollection.find().toArray();
      res.send(result)
    })

    app.post('/admin', async(req, res)=>{
      const hr = req.body;
      const  query = {email:hr.email}
      const existingUser = await hrCollection.findOne(query);
      if(existingUser){
        return res.send({message: "user already exist"})
      }
      const result = await hrCollection.insertOne(hr);
      res.send(result)
    })
    app.get('/admin', async (req, res) => {
      const userEmail = req.query.email;
    
      if (!userEmail) {
        return res.status(400).json({ error: 'Email parameter is required.' });
      }
    
      // Modify the query to filter based on the provided email
      const result = await hrCollection.find({ email: userEmail }).toArray();
    
      res.send(result);
    });


    app.get('/employee', async (req, res) => {
      const userEmail = req.query.email;
    
      if (!userEmail) {
        return res.status(400).json({ error: 'Email parameter is required.' });
      }
    
      const result = await employeCollection.find({ email: userEmail }).toArray();
    
      res.send(result);
    });



    app.post('/addAsset', async(req, res)=>{
      const add = req.body;
      const result = await assetCollection.insertOne(add);
      res.send(result);
    })

    app.get('/addAsset', async(req,res)=>{
      const userEmail = req.query.email;
      if (!userEmail) {
        return res.status(400).json({ error: 'Email parameter is required.' });
      }
    
      // Modify the query to filter based on the provided email
      const result = await assetCollection.find({ email: userEmail }).toArray();
    
      res.send(result);
    })


    //team api



    app.get('/team', async(req,res)=>{
      const result = await myEmployeeCollection.find().toArray();
      res.send(result);
    })


    app.delete('/team/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await myEmployeeCollection.deleteOne(query)
      res.send(result);
    })

    // ===
    app.get('/request', async(req,res)=>{
      const result = await requestCollection.find().toArray();
      res.send(result);
    })
    app.get('/pending-requests', async(req,res)=>{
      const pendingRequests = await requestCollection.find({ status: 'pending' }).toArray();

      res.json(pendingRequests);
    })


    app.get('/requests-current-month', async (req, res) => {
      try {
    
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
        const currentYear = currentDate.getFullYear();
    
        const requestsCurrentMonth = await requestCollection.find({
          requestDate: {
            $regex: new RegExp(`^${currentYear}-${currentMonth.toString().padStart(2, '0')}`),
          },
        }).toArray();
    
        res.json(requestsCurrentMonth);
      } finally {
        // await client.close();
      }
    });



    app.get('/asssts-less-ten', async (req, res) => {
      const products = await assetCollection.find().toArray();
  
      // Filter products where productQuantity is less than 10
      const filteredProducts = products.filter(product => parseInt(product.productQuantity) < 10);
  
      res.json(filteredProducts);
    });


    app.delete('/request/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await requestCollection.deleteOne(query)
      res.send(result);
    })
    app.delete('/addAsset/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assetCollection.deleteOne(query)
      res.send(result);
    })

    app.delete('/customReq/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await customRequestCollection.deleteOne(query)
      res.send(result);
    })

    app.post('/myEmployee', async(req, res)=>{
      const myEmployee = req.body;
      const result = await myEmployeeCollection.insertOne(myEmployee);
      res.send(result)
    })

    app.get('/myEmployee', async(req, res)=>{
      const result = await myEmployeeCollection.find().toArray();
      res.send(result)
    })
    app.get('/addAsset/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const asset = await assetCollection.findOne(query);
      res.send(asset);
    })

    app.put('/updateAsset/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: req.body }; // Assuming req.body contains the updated fields
    
      try {
        const result = await assetCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    
    app.patch('/customReq/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set : {
          role: 'approved'
        }
      }

      const result = await customRequestCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.put('/request/approve/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        // Update the status to 'approved' in MongoDB
        await requestCollection.updateOne(
          query,
          { $set: { status: 'approved' } }
        );
    
        res.json({ message: 'Request approved successfully' });
      } catch (error) {
        console.error('Error updating data in MongoDB:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });





    app.post("/create-payment-intent", async (req, res) => {
      const { packages } = req.body;
      let amount = 100;
  if (packages === "5 Members for $5") {
    amount = 500;
  } else if (packages === "10 Members for $8") { 
    amount = 800;
  }
  else if (packages === "20 Members for $15") {
    amount = 1500;
  }
    
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ['card']
       
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });


    // employee
    app.get('/assets/:hrEmail', async (req, res) => {
      const email = req.params.hrEmail;  
      const assets = await assetCollection.find({ 'email': email }).toArray();
      res.json(assets);
    })

    app.post('/request', async(req,res)=>{
      const request = req.body;
      const result = await requestCollection.insertOne(request);
      res.send(result)
    })

    app.post('/customRequest', async(req,res)=>{
      const request = req.body;
      const result = await customRequestCollection.insertOne(request);
      res.send(result)
    })
    app.get('/customRequest', async(req,res)=>{
      const result = await customRequestCollection.find().toArray();
      res.send(result)
    })


    app.get('/profile', async(req,res)=>{
      const userEmail = req.query.email;
      if (!userEmail) {
        return res.status(400).json({ error: 'Email parameter is required.' });
      }
    
      const result = await employeCollection.find({ email: userEmail }).toArray();
    
      res.send(result);
    })


    app.get('/hrprofile', async(req,res)=>{
      const userEmail = req.query.email;
      if (!userEmail) {
        return res.status(400).json({ error: 'Email parameter is required.' });
      }
    
      // Modify the query to filter based on the provided email
      const result = await hrCollection.find({ email: userEmail }).toArray();
    
      res.send(result);
    })


    app.put('/profile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: req.body }; // Assuming req.body contains the updated fields
    
      try {
        const result = await employeCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.put('/hrprofile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: req.body }; // Assuming req.body contains the updated fields
    
      try {
        const result = await hrCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.get('/asset/:type', async(req, res)=>{
      const { type } = req.params;
      try {
        // Connect to MongoDB
        await client.connect();
  
        // Fetch data based on the "type" field
        const filteredData = await assetCollection.find({ type }).toArray();
    
        res.json(filteredData);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
  res.send("asset management running")

})

app.listen(port, ()=>{
  console.log(`blog running on port ${port}`)
})