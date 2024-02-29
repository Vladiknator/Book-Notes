import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';
import { networkInterfaces } from 'os';

const app = express();
const port = 3000;

// get current IP address, assign as hostname
const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

const hostname = results['Ethernet 2'][0];

app.set('view engine', 'ejs');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/new', (req, res) => {
  res.render('new');
});

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port} on ip ${hostname}`);
});
