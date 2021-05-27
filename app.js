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


mongoose.connect("mongodb+srv://"+process.env.MONGO_URL+"{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);


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


    async function runSample(projectId = process.env.PROJECT_ID) {
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
                    text: "hello there!",
                    languageCode: 'en-US',
                },
            },
        };


        const responses = await sessionClient.detectIntent(request);
        //console.log('Detected response');
        const result = responses[0].queryResult;
        //console.log(result);

        //console.log(result.fulfillmentText);

        if (result.intent) {
            //console.log(result.fulfillmentText);

            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: result.fulfillmentText,
                    to: 'whatsapp:+' + req.body.WaId
                })
                .then(message => {})
                .done();
        } else {

            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    body: 'couldnt understand please send valid text',
                    to: 'whatsapp:+' + req.body.WaId
                })
                .then(message => {})
                .done();
        }
    }

    runSample()
});

app.listen(process.env.PORT || 3000, function() {
    console.log("up and running on port 3000");
});
