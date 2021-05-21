//jshint esversion:6

require('dotenv').config();
const express =require("express");
const bodyParser =require("body-parser");
const ejs =require("ejs");
const app =express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine",ejs);

const client = require('twilio')('AC22436ed4ee584c98915c5e952d711510','4c5440cacbaad12e61243b592d2ff80d');
//const whatsappUrl = "whatsapp://send?phone=+14155238886&text=join dug-sick."

app.get("/",function(req,res){
res.send("hello there");
});

app.post("/sms",function(req,res){
    client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hello there i did recieve your message but not going to forward it back to you',
         to: 'whatsapp:+917022191900'
       })
      .then(message => console.log(message))
      .done();
});

app.listen(process.env.PORT||3000,function(){
    console.log("up and running on port 3000");
});
