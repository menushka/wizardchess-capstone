// https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/362

const Alexa = require('ask-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const skill = require("./lambda").skill;

const port = 8080;

app.use(bodyParser.json());
app.post('/', function(req, res) {

  skill.invoke(req.body)
    .then(function(responseBody) {
      res.json(responseBody);
    })
    .catch(function(error) {
      console.log(error);
      res.status(500).send('Error during the request');
    });
});

app.listen(port, function () {
  console.log(`Wizard chess listening on port ${port}!`);
});