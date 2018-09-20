const express = require('express'),
      app = express(),
      cors = require('cors'),
      request = require('request'),
      BASE_URL='http://lcboapi.com',
      API_KEY='MDplMGY4ZTBkYy1iYzIxLTExZTgtOTU3Zi0xYmRjOWEzMWZmNzk6VE43QWZmYUZCRXRFazcwMXZKWnFBNEhzYTREVVJrYW92V3BG'

// Enable cross-origin resource sharing.
app.use(cors());

app.listen(8005, () => {
  console.log('Server Listening!')
})

app.use('/products', (req, res) => {
    let url =  `${BASE_URL}/products?access_key=${API_KEY}`;
    if(req.query.searchText){
        url+=`&q=${req.query.searchText}`;
    }
    console.log('Received hit: '+url)
  request(url, (error, response, body) => {
    res.send(body)
  })
})


