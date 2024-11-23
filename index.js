require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyPaser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
})

const Url = mongoose.model('Url', urlSchema)
app.use(express.json())

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async(req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = shortid.generate();

  const newUrl = new Url({ originalUrl, shortUrl });
  await newUrl.save();

  res.json({ originalUrl, shortUrl });
})

app.get('/api/shortUrl/:short_url', async(req, res) => {
  const { shortUrl } = req.params
  const url = await Url.findOne({ shortUrl })

  if (url) {
    res.redirect(url.originalUrl)
  } else {
    res.json({error: 'invalid url'})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
