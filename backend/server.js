import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import testRoutes from "./routes/testRoutes.js";


import { initialiseDatabase } from "./config/initailiseDatabase.js";


dotenv.config();

const app= express();


initialiseDatabase();

// JSON request parsing
app.use(express.json());

//cors enables communication 
 app.use(cors());


// Helmet for security
app.use(helmet());

// HTTP request logging
app.use(morgan("dev"));



const PORT=process.env.PORT || 3000;



app.get("/",(req,res)=>{
    res.send("hello from the server route");
});



app.use("/api/testRoutes",testRoutes);





app.listen(PORT,()=>{
    console.log("server is running on port 3000");
});

