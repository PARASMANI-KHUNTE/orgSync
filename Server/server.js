const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
let frontendURl =  ""
if(process.env.Status == "production"){
    frontendURl = process.env.FRONTEND_URL
}else{
    frontendURl = process.env.DevUrl
}
app.use(cors({
    origin : frontendURl
}));
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const {connectDB} = require('./config/dbConfig');
connectDB();

const port = process.env.PORT;


app.get('/test',(req,res)=>{
    res.send("Server is up");
});

app.get('/api/test',(req,res)=>{
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


const BranchManagerRoute = require('./Routes/BranchManager')
app.use('/api/BranchManager',BranchManagerRoute)

const DepartmentRoute = require('./Routes/Department')
app.use("/api/departments",DepartmentRoute)


const EmployeeRoute = require('./Routes/Employee')
app.use('/api/employee',EmployeeRoute)

const AttendanceRoute  =  require('./Routes/AttendenceRoute')
app.use('/api/attendence'  ,AttendanceRoute)

app.listen(port,()=>{
    console.log(`Server is up on http://localhost:${port}`)
})




