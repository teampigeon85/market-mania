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

// 🧩 Test Route 2 — Login (dummy)
app.post("/api/emailauth/login", (req, res) => {
  console.log("✅ POST /api/emailauth/login called");
  console.log("📩 Request body:", req.body);

  const { email, password } = req.body;

  if (email === "test@gmail.com" && password === "123456") {
    console.log("✅ Valid credentials received");
    return res.json({
      token: "dummy-jwt-token",
      user: { id: 1, name: "Test User", email }
    });
  } else {
    console.log("❌ Invalid credentials");
    return res.status(401).json({ message: "Invalid email or password" });
  }
});

// 🧩 Test Route 3 — Google Login (dummy)
app.get("/api/googleauth/google", (req, res) => {
  console.log("✅ Google OAuth endpoint hit");
  res.json({ message: "Google login simulated" });
});



app.listen(PORT,()=>{
    console.log("server is running on port 3000");
});

