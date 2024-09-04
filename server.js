const express = require('express');
const app = express();
const path = require('path');
const cookieparser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const port = process.env.port || 5000;
const mainRouter = require("./routes/mainRouter")

//Listen to port
app.listen(port, () => {
    console.log("App is listening on port " + port);
});

//Setting the templating engine
app.set("view engine", "ejs");

app.use(cookieparser("AbcEdfGJH"));
app.use(
  session({
    secret: "AbcEdfGJH",
    saveUninitialized: true,
    resave: true,
    saveUninitialized: true,
    unset: 'keep',
    cookie: {
      maxAge: 100000000000000000000*60*60*1000

    }
  })
);
app.use(flash());

app.use(express.urlencoded({extended: true}));

//Routing
app.use('/', mainRouter);

//Access static files in public folder
app.use((express.static(path.join(__dirname, "public"))));