import {neon} from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const {PGHOST,PGDATABASE,PGUSER,PGPASSWORD}=process.env;

//create connection using environamental varibles
export const sql=neon (
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
);


export async function initialiseDatabase () {
    try {
        //sample query start  inside `` write your queries
        await sql `
        CREATE TABLE  IF NOT EXISTS testTable (
        title varchar(60),
        description TEXT,
        price NUMERIC (10,2),
        createdAt TIMESTAMP DEFAULT NOW()
    )   
    `
    //sample end 
console.log("database intialised");
    }
    catch (error) {
        console.log("unable to intialise",error);
    }
}
