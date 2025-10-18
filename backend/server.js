import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from 'express-session';


import googleauthRoutes from "./routes/googleauthRoutes.js";
import emailauthRoutes from "./routes/emailauthRoutes.js";
import { configurePassport } from "./controllers/googleauthControllers.js";
import gameRoutes from "./routes/gameRoutes.js";


import { logoutUser } from "./controllers/userControllers.js";
import { initialiseDatabase } from "./config/initailiseDatabase.js";


dotenv.config();

const app= express();


configurePassport();

initialiseDatabase();

//sessions

app.use(session({
  secret: process.env.SESSION_SECRET || 'random string',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true only if using https
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// JSON request parsing
app.use(express.json());

//cors enables communication 
app.use(
        cors({
            origin: 'http://localhost:5173',
            credentials: true,
        })
    );




// Helmet for security
app.use(helmet());

// HTTP request logging
app.use(morgan("dev"));



const PORT=process.env.PORT || 3000;



app.get("/",(req,res)=>{
    res.send("hello from the server route");
});


// Authentication routes
app.use("/api/googleauth", googleauthRoutes);
app.use("/api/emailauth", emailauthRoutes);

app.use("/api/game",gameRoutes);


app.post("/api/auth/logout",logoutUser);

app.listen(PORT,()=>{
    console.log("server is running on port 3000");
});

