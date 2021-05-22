//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", 'ejs');


mongoose.connect("mongodb://localhost:27017/whatsappDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const client = require('twilio')('AC22436ed4ee584c98915c5e952d711510', '4c5440cacbaad12e61243b592d2ff80d');
//const whatsappUrl = "whatsapp://send?phone=+14155238886&text=join dug-sick."

const credsSchema = new mongoose.Schema({
    name: String,
    phNumber: {
        type: Number,
        required: true
    }
});

const Creds = new mongoose.model("Creds", credsSchema);

app.get("/", function(req, res) {
    res.render("home", {
        title: "SIGN UP FOR JOKES"
    });
});


app.post("/register", function(req, res) {


    Creds.findOne({
        phNumber: req.body.phNumber
    }, function(err, cred) {
        if (!err) {
            if (cred) {
                res.render("failure", {
                    failureText: "looks like the number you have entered already exists please check the number you have entered"
                });
            } else {
                const cred = new Creds({
                    name: req.body.name,
                    phNumber: req.body.phNumber
                });
                cred.save();
                res.render("success");
            }
        } else {
            res.render("failure",{failureText:"looks like there was an error in the process please check the number you have entered and try again"});
        }

    });

});

app.post("/sms", function(req, res) {
    console.log(req.body);
    console.log("this end of req and begining of res");
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: 'Hello there i did recieve your message but not going to forward it back to you',
            to: 'whatsapp:+917022191900'
        })
        .then(message => console.log(message))
        .done();
});

app.listen(process.env.PORT || 3000, function() {
    console.log("up and running on port 3000");
});
