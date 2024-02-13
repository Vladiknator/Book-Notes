import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';

const app = express();
const port = 3000;
const hostname = '192.168.3.176';

app.set('view engine', 'ejs');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});
