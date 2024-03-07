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

async function doSQL(statement, params) {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'notesdb',
    user: 'postgres',
    password: 'password',
  });
  await client.connect();
  await client.query('SET TIME ZONE $1', ['UTC']);
  const response = await client.query(statement, params);
  await client.end();
  return response;
}

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', urlencodedParser, (req, res) => {
  const newPost = {
    title: req.body.title,
    author: req.body.author,
    oLId: req.body.oLId,
    desc: req.body.desc,
    stars: req.body.stars,
    sDate: Date.parse(req.body.sDate),
    fDate: Date.parse(req.body.fDate),
    aDate: Date.now(),
    notes: req.body.notes,
  };

  doSQL(
    'INSERT INTO public.book(open_lib_id, author, title, description) VALUES ($1, $2, $3, $4);',
    [newPost.oLId, newPost.author, newPost.title, newPost.desc],
  );

  doSQL(
    'INSERT INTO public.note(open_lib_id, rating, date_started, date_finished, date_added, notes) VALUES ($1, $2, to_timestamp($3)::date, to_timestamp($4)::date, to_timestamp($5)::date, $6);',
    [
      newPost.oLId,
      newPost.stars,
      Math.floor(newPost.sDate.valueOf() / 1000),
      Math.floor(newPost.fDate.valueOf() / 1000),
      Math.floor(newPost.aDate.valueOf() / 1000),
      newPost.notes,
    ],
  );

  res.redirect('/');
});

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port} on ip ${hostname}`);
});
