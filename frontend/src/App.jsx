import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"
import GameArena from "./pages/GameArena"
import HomePage from "./pages/homepage"
import LoginPage from "./pages/loginpage"
import RegisterPage from "./pages/RegisterPage"
import UserHomePage from "./pages/UserHomePage"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user-home" element={<UserHomePage />} />
         <Route path="/game/:roomId" element={<GameArena />} />
      </Routes>
    </Router>
  )
}

export default App
