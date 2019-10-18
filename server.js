var express = require('express'),
app = express(),
cors = require('cors'),
port = process.env.PORT || 4000,
fs = require('fs'),
dirData = JSON.parse(fs.readFileSync('diretorias.json', 'utf8')),
filesPath = './anexos/',
filesArray = fs.readdirSync(filesPath);

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

console.log('Message RESTful API server started on: ' + port);
