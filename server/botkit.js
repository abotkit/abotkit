const express = require('express');
const app = express();
const { db, executeQuery, executeSelectQuery } = require('./db.js');
const cors = require('cors')
const axios = require('axios').default;
app.use(express.json());
app.use(cors())

app.get('/bot', (req, res) => {
  axios.get('http://localhost:5000/').then(response => {
    res.status(200).end();
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/bot/actions', (req, res) => {
  axios.get('http://localhost:5000/actions').then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/actions', (req, res) => {
  const sql = 'SELECT * FROM actions';
  db.all(sql, (error, actions) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ actions });
    }
  });  
});

app.post('/action', (req, res) => {
  const sql = `INSERT INTO actions (code) VALUES (?)`;
  const params = req.body.code;

  db.run(sql, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  });
});

app.get('/phrases', (req, res) => {
  const sql = 'SELECT * FROM phrases';
  db.all(sql, (error, phrases) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ phrases });
    }
  });  
});

app.post('/phrase', (req, res) => {
  const sql = `INSERT INTO phrases (intent, text) SELECT id, '${req.body.text}' FROM intents WHERE name='${req.body.intent}'`;

  db.run(sql, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  });
});

app.get('/intents', (req, res) => {
  const sql = 'SELECT * FROM intents ORDER BY id';
  db.all(sql, (error, intents) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ intents });
    }
  });
});

app.post('/intent/action', (req, res) => {
  const sql = `UPDATE intents SET action=${req.body.action} WHERE intents.id=${req.body.intent}`
  db.run(sql, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  });
});

app.post('/bot/bake', async (req, res) => {
  if (req.body.bot_type === 'abotkit-core') {
    const configuration = {};
    configuration.name = 'Default Bot';
    configuration.core = {
      name: 'transformer',
      intents: {}
    };

    db.all('SELECT id FROM intents ORDER BY id', async (error, intents) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } 
    
      for (const intent of intents) {
        const examples = await executeSelectQuery(`SELECT e.text, i.name FROM examples e INNER JOIN intents i ON e.intent=i.id WHERE e.intent='${intent.id}'`)
        for (const example of examples) {
          configuration.core.intents[example.text] = example.name;
        }
      }

      if (req.body.dry_run) {
        res.status(200).json(configuration);
      } else {
        res.status(200).end();
      }
    });
  } else {
    res.status(400).json({ error: 'You need to provide a valid bot_type in your post body. Currently only "abotkit-core" is supported.' })
  }
});

app.post('/bot/handle', (req, res) => {
  axios.post('http://localhost:5000/handle', { query: req.body.query }).then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.post('/bot/explain', (req, res) => {
  axios.post('http://localhost:5000/explain', { query: req.body.query }).then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.get('/intent/:intent/examples', (req, res) => {
  const sql = `SELECT e.id, e.created, e.text, i.name FROM examples e INNER JOIN intents i ON e.intent=i.id WHERE i.id='${req.params.intent}'`;
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

  db.run(sql, error  => {
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

  db.run(sql, params, async (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      if (typeof req.body.examples !== 'undefined') {
        for (const example of req.body.examples) {
          const query = `INSERT INTO examples (intent, text) SELECT id, '${example}' FROM intents WHERE name='${req.body.name}'`;
          try {
            await executeQuery(query);
          } catch (error) {
            return res.status(400).json({ error: 'some examples could not be added: ' + error.message });
          }
        }
        res.status(200).end();
      } else {
        res.status(200).end();
      }
    }
  });  
});

app.listen(3000, () => {
  console.log('A bot kit listening on port 3000!');
});