'use strict';
var clientId = process.env.SF_CLIENT_ID;
var clientSecret = process.env.SF_CLIENT_SECRET;
var redirectURI = process.env.SF_REDIRECT_URI;
var API = process.env.API || 'v32.0';
var oauth_timeout = process.env.oauth_timeout || 5400;
var DEBUG_ON = process.env.DEBUG_ON || true;
var username=process.env.SF_USER_NAME;
var password=process.env.SF_PASSWORD;
var envuri=process.env.SF_ENV_URI;
const express = require('express');
const bodyParser = require('body-parser');

var sf = require('node-salesforce');
   

//Connected App credentials for OAUTH request
var conn = new sf.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env. 
  loginUrl : envuri 
});
//var accesstoken
conn.login(username, password, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information. 
  // Save them to establish connection next time. 
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property 
 // console.log("User ID: " + userInfo.id);
  //console.log("Org ID: " + userInfo.organizationId);
   
  // ... 
   //return conn;
});



const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');
   console.log(conn.accessToken);
 
    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;
            console.log(requestBody);
            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }
console.log('>>>'+requestBody.result.parameters.SearchtermText);
                if (requestBody.result.parameters.SearchtermText!='') {
                    
                    speech += 'action: ' + requestBody.result.action;
                   console.log('>>>'+requestBody.result.parameters.SearchtermText);
                        var body={key:requestBody.result.parameters.SearchtermText};
                     conn.apex.post("/analyzeRequest/", body, function(errv,resvar)  {
                    if (errv) {  console.error(errv); }
                    console.log("total : " + JSON.stringify(resvar));
                        speech=JSON.stringify(resvar);
                        var i=0;
                     /* for(i=0;i<resvar.response.size();i++){
                          var feedItemId=resvar.response[i].feeditem.Id;
                          var feedItemBody=resvar.response[i].feeditem.Body;
                          //var content=
                        speech+='<b> hii </b>';
                         
                      } 
                    */    
                        return res.json({
            speech: speech,
            displayText: speech,
            source: 'apiai-webhook-sample'
        });
                    //console.log("fetched : " + result.records.length);
                  });
                }
           }
        }
  
        console.log('result: ', speech);

        
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
