//------------modules used-------------//
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
//------------modules used-------------//
mongoose.set('strictQuery', true);
const app = express();
app.use(helmet());
// allow the app to use cookieparser
app.use(cookieparser());
// allow the express server to process POST request rendered by the ejs files 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//-------------------mongodb-----------------//
mongoose.connect("mongodb://localhost:27017/loginDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: {type: String},
    pass: {type: String},
})
const User = new mongoose.model("User", userSchema);
//-------------------mongodb-----------------//

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    // check if user is logged in, by checking cookie
    let username = req.cookies.username;
    if(username){
        return res.render("mainpage", {
            username,
        });
    }else{
        res.redirect("/login");
    }

});
app.get("/mainpage", (req, res) => {
    // check if user is logged in, by checking cookie
    let username = req.cookies.username;
    if(username){
        return res.render("mainpage", {
            username,
        });
    }else{
        res.redirect("/login");
    }

});
app.get("/register", (req, res) => {

    return res.render("signup");

});

app.get("/login", (req, res) => {
    // check if there is a msg query
    let bad_auth = req.query.msg ? true : false;

    // if there exists, send the error.
    if (bad_auth) {
        return res.render("login", {
            error: "Invalid username or password",
        });
    } else {
        // else just render the login
        return res.render("login");
    }
});

app.post("/login", async (req, res) => {
    // get the data
    const name = req.body.login_username;
    const passwd = req.body.login_password;

    let a = await User.findOne({email: name}).exec();
    if(a){
        console.log('found');
        let b = a.pass;
        let c = md5(passwd);
        if (b==c){
            
            res.cookie("username", name, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                secure: true,
                httpOnly: true,
                sameSite: 'lax'
            });
            console.log('pass match');
        }
        res.redirect("/")
    }else{
        console.log('not found');
        res.redirect("/")
    }

});

app.post("/register",(req,res)=>{
    let { given_username, given_password } = req.body;

    const newUser = new User({
        email: given_username,
        pass: md5(given_password),
    });

    newUser.save((err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('saved');
        }
    })

    res.cookie("username", given_username, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });
    
    res.redirect("/")
})

app.get("/logout", (req, res) => {
    // clear the cookie
    res.clearCookie("username");
    // redirect to login
    return res.redirect("/login");
});



app.listen('3000', () => console.log(`server started`));