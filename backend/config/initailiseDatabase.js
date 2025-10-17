import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

//create connection using environamental varibles
export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
);

export async function initialiseDatabase() {
  try {

    await sql`
    CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password TEXT,
    google_id VARCHAR(100),
    last_login TIMESTAMP DEFAULT NOW()
);
    `;
    await sql`
    CREATE TABLE IF NOT EXISTS game_chats (
        message_id SERIAL PRIMARY KEY,
        game_id VARCHAR(100) NOT NULL,
        user_id INTEGER REFERENCES users(user_id),
        username VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    `;

    // --- NEW: Added games table to manage game sessions ---
    await sql`
    CREATE TABLE IF NOT EXISTS games (
        game_id VARCHAR(100) PRIMARY KEY,
        created_by_user_id INTEGER REFERENCES users(user_id),
        game_status VARCHAR(50) DEFAULT 'waiting', -- e.g., 'waiting', 'in_progress', 'finished'
        created_at TIMESTAMP DEFAULT NOW()
    );
    `;

    // --- NEW: Added game_participants to link users to games ---
    await sql`
    CREATE TABLE IF NOT EXISTS game_participants (
        game_id VARCHAR(100) REFERENCES games(game_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (game_id, user_id) -- Ensures a user cannot join the same game twice
    );
    `;

    //sample end
    console.log("database intialised");
  } catch (error) {
    console.log("unable to intialise", error);
  }
}

