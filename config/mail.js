import ElasticEmail from '@elasticemail/elasticemail-client';
 
let defaultClient = ElasticEmail.ApiClient.instance;
 
let apikey = defaultClient.authentications['apikey'];
apikey.apiKey = "239DF3DC02931A950A55F0ACC39D9CD071258AFB91143BA58D4AEC43CECC84ABC4A19DE615114696B12294DA18B89232"
 
let api = new ElasticEmail.EmailsApi()

let email = undefined

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('Email Sent successfully.');
  }
};

const sendEmail = (mailData = {
  to: "",
  subject: "",
  content: ""
}) => {

  email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      new ElasticEmail.EmailRecipient(mailData.to)
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: mailData.content
        })
      ],
      Subject: mailData.subject,
      From: "no_reply@sistfms.me"
    }
  });

  api.emailsPost(email, callback);
}

export default sendEmail;
 

