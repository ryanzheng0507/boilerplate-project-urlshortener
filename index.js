require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns')
const urlparser = require('url')

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})

const Url = mongoose.model('Url', urlSchema)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  
  dns.lookup(urlparser.parse(original_url).hostname, (err, address) => {
    if (!address) {
      res.json({error: 'invalid url'})
    } else {
      Url.findOne({original_url: original_url}).then((found) => {
        if (found) {
          res.json({
            originalUrl: found.original_url,
            short_url: found.short_url
          })
        } else {
          let short_url = 1;
          Url.find({}).sort({short_url: 'desc'}).limit(1).then((lastOne) => {
            if (lastOne.length > 0) {
              short_url = parseInt(lastOne[0].short_url) + 1
            }
            newObj = {
              original_url: original_url,
              short_url: short_url
            }
            let newUrl = new Url(newObj);
            newUrl.save();
            res.json(newObj);
          })
        }
      })
    }
  })


})

app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url
  Url.findOne({ short_url: short_url }).then((found) => {
    if (found) {
      let original_url = found.original_url;
      res.redirect(original_url);
    } else {
      res.json({error: 'the short url does not exist'})
    }
  })
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
