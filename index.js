'use strict';
var clientId = process.env.SF_CLIENT_ID;
var clientSecret = process.env.SF_CLIENT_SECRET;
var redirectURI = process.env.SF_REDIRECT_URI;
var API = process.env.API || 'v32.0';
var oauth_timeout = process.env.oauth_timeout || 5400;
var DEBUG_ON = process.env.DEBUG_ON || true;
var username=process.env.SF_USER_NAME;
var password=process.env.SF_PASSWORD;
const express = require('express');
const bodyParser = require('body-parser');
var sf = require('node-salesforce');
   

//Connected App credentials for OAUTH request
var conn = new sf.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env. 
  loginUrl : 'https://login.salesforce.com' 
});
var  org=conn.login(username, password, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information. 
  // Save them to establish connection next time. 
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property 
 // console.log("User ID: " + userInfo.id);
  //console.log("Org ID: " + userInfo.organizationId);
   
  // ... 
   return conn;
});



const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');
   console.log(org.accessToken);
    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            source: 'apiai-webhook-sample'
        });
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
