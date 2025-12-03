const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");


require("dotenv").config({path: "./config.env"});
const port = process.env.PORT;

const dbo = require("./db/conn");

app.use(cors(
    {
        origin: "http://localhost:5000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
        optionsSuccessStatus: 204,
        allowedHeaders: ["Content-Type", "Authorization"],
    }
));


app.use(session(
    {
        secret: 'super_secret_personal_key_for_this_sessions_thing_please_dont_be_taken_for_group_7',
        saveUninitialized: false, //dont create session until something is stored
        resave: false, //dont save session if unmodified
        store: MongoStore.create({
            mongoUrl: process.env.ATLAS_URI
        }),
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 
        }
    }
));

app.use(express.json());


app.get("/", (req,res) =>{
    res.send("Hello, World!");
});
dbo.connectToServer(function(err){
    if (err){

        console.error("MongoDB Connection Failed:", err);
        process.exit(1); 
    }
    app.use(require("./routes/record"));
    app.listen(port, () =>{
        console.log(`Server is running on port ${port}`);
    });
});