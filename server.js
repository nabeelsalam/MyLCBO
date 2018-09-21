const express = require('express'),
      app = express(),
      cors = require('cors'),
      request = require('request'),
      BASE_URL='http://lcboapi.com',
      API_KEY='MDplMGY4ZTBkYy1iYzIxLTExZTgtOTU3Zi0xYmRjOWEzMWZmNzk6VE43QWZmYUZCRXRFazcwMXZKWnFBNEhzYTREVVJrYW92V3BG',
      bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8005, () => {
  console.log('Server Listening!')
})

app.get('/products', (req, res) => {
    let url =  `${BASE_URL}/products?access_key=${API_KEY}`;
    if(req.query.searchText && req.query.searchText.length > 0){
        url+=`&q=${req.query.searchText}`;
    }
    if(req.query.store && req.query.store != 0){
        url+=`&store_id=${req.query.store}`;
    }
    console.log('Received hit: '+url)
  request(url, (error, response, body) => {
    res.send(body)
  })
})

app.get('/stores', (req, res) => {
    let url =  `${BASE_URL}/stores?per_page=50&access_key=${API_KEY}`;
    if(req.query.searchText){
        url+=`&geo=${req.query.searchText}`;
    }
    console.log('Received hit: '+url)
  request(url, (error, response, body) => {
    res.send(body)
  })
})

app.post('/stock', function(req, res) {
    const ids = req.body.productIds;
    let promises = [];
    ids.forEach(id => {
        let url =  `${BASE_URL}/stores/${req.body.store}/products/${id}/inventory?access_key=${API_KEY}`;
        promises.push(new Promise((resolve)=>{
            request(url, (error, response, body) => {
                resolve(body);
            })
        }))
    });
    Promise.all(promises)
        .then((results) => {
            console.log(results)
            let stockObject = {}
            results.forEach((el,index) => {
                let key = ids[index];
                stockObject[key] = JSON.parse(el).result;               
            });
            res.send(stockObject); 
        })
        .catch(err => console.log(err));
});


