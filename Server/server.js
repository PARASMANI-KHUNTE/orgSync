const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const {connectDB} = require('./config/dbConfig');
connectDB();

const port = process.env.PORT;


app.get('/test',(req,res)=>{
    res.send("Server is up");
});

app.get('/',(req,res)=>{
    res.send("Server is up");
});


//main work below 

const adminRoute = require('./Routes/SuperAdmin')
app.use("/api/superadmin",adminRoute);

const serviceRoute = require('./Routes/Services')
app.use('/api/services',serviceRoute)

const OrgRoute = require('./Routes/Organization')
app.use('/api/org',OrgRoute)


const BranchRoute = require('./Routes/Branch')
app.use('/api/branch',BranchRoute)






app.listen(port,()=>{
    console.log(`Server is up on http://localhost:${port}`)
})




