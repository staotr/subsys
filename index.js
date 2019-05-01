const express = require('express');
var bodyParser = require("body-parser");
const validator = require("email-validator");
const app = express();

const Mailchimp = require('mailchimp-api-v3')
const crypto = require('crypto')
const mailchimp = new Mailchimp(api_key);


function addNurtureSub(email, response) {
  /*
    Function handles the creation of nurture subscribers and the update of existing subscribers
   */

  // turn email into lower case and turn into md5 hash
  const email_hash = crypto.createHash('md5').update(email).digest("hex")

  // Function Creates a new user
  mailchimp.post({
    path: '/lists/382de78e4c/members/',
    body: {
      email_address: email,
      status: 'subscribed',
      interests: {
        'b2e886c648': true,
      },
    }
  }).then(function(res) {
    response.sendStatus(200);
  }).catch(function(err) {
    console.log(err);
    // Condition for when user already exists
    if (err.status == 400 && err.title == 'Member Exists') {

      // edit subscriber into the nurture group
      // Look up user and edit their information
      /****************************/
        mailchimp.request({
          method: 'patch',
          path: '/lists/382de78e4c/members/' + email_hash,
          body: {
            interests: {
              'b2e886c648': true,
            },
          },
        }).then(function(res) {
          response.sendStatus(200);
        }).catch(function(err) {
          console.log(err);
          response.sendStatus(400);
        });
      /****************************/
    } else {
      // return error
      response.sendStatus(400);
    }
    // End if Condition
  });

}

app.use(bodyParser.urlencoded({ extended: false }));

// Landing page new nurture subscriber endpoint
app.post('/new_nurture_sub', function (req, res) {

  const email = req.body.email;

  // if email passes validation
  if (validator.validate(email)) {
    addNurtureSub(email, res);
  } else {
    res.sendStatus(400);
  }

});


app.listen(8000, () => {
  console.log('Server is indeed running');
});
