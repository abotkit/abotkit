const express = require('express');
const app = express();
const db = require('./db.js');
const cors = require('cors')
const axios = require('axios').default;
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
  axios.get('http://localhost:5000/').then(response => {
    res.status(200).end();
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/actions', (req, res) => {
  axios.get('http://localhost:5000/actions').then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/intents', (req, res) => {
  const sql = 'SELECT * FROM intents';
  db.all(sql, (error, intents) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ intents: intents });
    }
  });
});

app.post('/handle', (req, res) => {
  axios.post('http://localhost:5000/handle', { query: req.body.query }).then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.post('/explain', (req, res) => {
  axios.post('http://localhost:5000/explain', { query: req.body.query }).then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/intent/:name/examples', (req, res) => {
  const sql = `SELECT e.id, e.created, e.text FROM examples e JOIN intents i WHERE i.name='${req.params.name}'`;
  db.all(sql, (error, examples) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ examples: examples });
    }
  });  
});

app.post('/example', (req, res) => {
  const sql = `INSERT INTO examples (intent, text) SELECT id, '${req.body.text}' FROM intents WHERE name='${req.body.intent}'`;

  db.run(sql, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  }); 
});

app.post('/intent', (req, res) => {
  const sql = 'INSERT INTO intents (name) VALUES (?)';
  const params = req.body.name;

  db.run(sql, params, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  });  
});

app.listen(3000, () => {
  console.log('A bot kit listening on port 3000!');
});