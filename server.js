var express = require('express'),
app = express(),
cors = require('cors'),
port = process.env.PORT || 4000,
fs = require('fs'),
dirData = JSON.parse(fs.readFileSync('diretorias.json', 'utf8')),
mailConfig = JSON.parse(fs.readFileSync('config.json', 'utf8')),
filesPath = './anexos/',
filesArray = fs.readdirSync(filesPath);
var bodyParser = require("body-parser");
var xoauth2 = require('xoauth2');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(mailConfig);

//RENAME ALL ATTACHMENTS
filesArray.map(f => {
  fs.renameSync(filesPath + f, filesPath + f.replace(/ /g, '-'));
})

app.use(cors())
app.listen(port);

app.get('/get-dir-data', (req, res) => {
  res.json(dirData)
})

app.get('/get-file-list', (req,res) => {
  res.json(fs.readdirSync(filesPath))
})

app.use('/serve-pdf', express.static(filesPath));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {

  var mailOptions = {
    from : 'DAEE DSD/ADA <avelez@sp.gov.br>', // sender address
  	replyTo : "avelez@sp.gov.br",
    to: req.body.mailTo,
  	bcc: "avelez@sp.gov.br",
    subject: req.body.subject, // Subject line
  	generateTextFromHTML: true,
  	html: req.body.mailbody, // html body
    attachments: [{
      filename: req.body.fileName,
      path: filesPath + req.body.filePath
    }]
  }
  console.log(mailOptions);
  transporter.sendMail(mailOptions).then(function(error, info){
		if(error){
			res.send(error);
		}
    if (!fs.existsSync('./contas/' + req.body.anoRef)){
      fs.mkdirSync('./contas/' + req.body.anoRef);
    }
    fs.renameSync(mailOptions.attachments[0].path,  './contas/' + req.body.anoRef+'/'+ mailOptions.attachments[0].filename)
    res.end(info);
  })


})

console.log('Message RESTful API server started on: ' + port);
