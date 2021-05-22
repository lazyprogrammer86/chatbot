//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", 'ejs');


mongoose.connect("mongodb+srv://admin-adarsh:admin-adarsh@todolist.ibwmb.mongodb.net/whatsappDB?retryWrites=true", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const client = require('twilio')('AC22436ed4ee584c98915c5e952d711510', '4c5440cacbaad12e61243b592d2ff80d');


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
            res.render("failure", {
                failureText: "looks like there was an error in the process please check the number you have entered and try again"
            });
        }

    });

});

// ////////////////////////// whatsapp sending opertations/////////////////////////


app.post("/sms", function(req, res) {

    console.log(req.body);
     async function runSample(projectId = 'jokes-onla') {
        // A unique identifier for the given session
        const sessionId = uuid.v4();

        // Create a new session
        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: __dirname + "/jokes-onla-9c37d26737f4.json"
        });
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: 'tell me a joke',
                    languageCode: 'en-US',
                },
            },
        };


        const responses = await sessionClient.detectIntent(request);
        console.log('Detected response');
        const result = responses[0].queryResult;
        //console.log(result.queryText);
        //console.log(result.fulfillmentText);
        if (result.intent) {
            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: 'you said : ' + req.body.Body,
                    to: 'whatsapp:+91'+req.body.WaId
                })
                .then(message => {})
            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: result.fulfillmentText,
                    to: 'whatsapp:+91'+req.body.WaId
                })
                .then(message => {})
                .done();
        } else {
            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: 'couldnt understand please enter valid key',
                    to: 'whatsapp:+91'+req.body.WaId
                })
                .then(message => {})
        }
    }

    runSample()





});

app.listen(process.env.PORT || 3000, function() {
    console.log("up and running on port 3000");
});
