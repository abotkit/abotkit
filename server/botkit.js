const express = require('express');
const app = express();
const { db, initDatabase, executeQuery, executeSelectQuery } = require('./db.js');
const cors = require('cors')
const axios = require('axios').default;
app.use(express.json());
app.use(cors())

app.get('/bots', async (req, res) => {
  const sql = 'SELECT id, name FROM bots';
  try {
    const bots = await executeSelectQuery(sql);
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/bot/:name/status', async (req, res) => {
  const sql = 'SELECT name, host, port FROM bots WHERE name=?';
  let response = null
  try {
    response = await executeSelectQuery(sql, [req.params.name]);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }

  try {
    await axios.get(`${bot.host}:${bot.port}/`);    
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/bot/:name/settings', async (req, res) => {
  try {
    const sql = 'SELECT name, host, port FROM bots WHERE name=?';
    const bot = (await executeSelectQuery(sql, [req.params.name]))[0];
    
    if (typeof bot !== 'undefined') {
      res.json(bot);
    } else {
      res.status(404).json({ error: 'Bot not found.' });
    }
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/bot/:name/actions', async (req, res) => {
  const sql = 'SELECT a.id, a.name, a.description, a.active, a.code FROM actions a INNER JOIN bots b ON a.bot=b.id WHERE b.name=?';
  let response = null
  try {
    response = await executeSelectQuery(sql, [req.params.name]);
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/action', (req, res) => {
  const sql = `INSERT INTO actions (name, bot) VALUES (?, ?)`;
  const params = [req.body.name, req.body.bot];

  db.run(sql, params, (error) => {
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

app.post('/phrases', async (req, res) => {
  let sql = `INSERT INTO phrases (intent, text) VALUES (?, ?)`;

  try {
    for (const params of req.body.phrases.map(phrase => [phrase.intentId, phrase.text])) {
      await executeQuery(sql, params);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  sql = 'SELECT name, host, port FROM bots WHERE name=?';
  let response = null
  try {
    response = await executeSelectQuery(sql, [req.body.bot_name]);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }
  
  try {
    await axios.post(`${bot.host}:${bot.port}/phrases`, { phrases: req.body.phrases.map(phrase => ({ text: phrase.text, intent: phrase.intentName })) });
  } catch (error) {
    return res.status(500).json(error);
  }

  res.status(200).end();
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

app.get('/bot/:name/intents', (req, res) => {
  const sql = `SELECT i.id, i.bot, i.action, i.created, i.name FROM intents i INNER JOIN bots b ON i.bot=b.id WHERE b.name='${req.params.name}' ORDER BY i.id`;
  db.all(sql, (error, intents) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(intents);
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

const bakeCoreBot = async botname => {
  const configuration = {};
  configuration.name = botname;
  configuration.core = {
    name: 'transformer',
    intents: {}
  };
  configuration.actions = [];
  configuration.phrases = {};

  const actions = await executeSelectQuery('SELECT name, active from actions');
  for (const action of actions) {
    configuration.actions.push({
      name: action.name,
      active: action.active === 1 ? { "intents": [] } : false
    });
  }

  try { 
    const intents = await executeSelectQuery('SELECT i.id, i.name, a.name as action FROM intents i INNER JOIN actions a ON i.action=a.id ORDER BY i.id');
    for (const intent of intents) {
      configuration.actions.find(action => action.name === intent.action && typeof action.active === 'object').active.intents.push(intent.name);
      const examples = await executeSelectQuery(`SELECT e.text, i.name FROM examples e INNER JOIN intents i ON e.intent=i.id WHERE e.intent='${intent.id}'`)
      for (const example of examples) {
        configuration.core.intents[example.text] = example.name;
      }
      const phrases = await executeSelectQuery('SELECT text FROM phrases WHERE intent=?', [intent.id]);
      for (const phrase of phrases) {
        if (typeof configuration.phrases[intent.name] === 'undefined') {
          configuration.phrases[intent.name] = [ phrase.text ];
        } else {
          configuration.phrases[intent.name].push(phrase.text);
        }
      }
    }
  } catch (error) {
    throw error;
  }

  return configuration;
} 

app.post('/bot/bake', async (req, res) => {
  if (typeof req.body.bot_name === 'undefined') {
    return res.status(400).json({ error: 'You need to provid a bot name using bot_name in your request body'})
  }

  const sql = `SELECT name, host, port FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }

  if (req.body.bot_type === 'abotkit-core') {
      let configuration = {};
      try {
        configuration = await bakeCoreBot(req.body.bot_name);
      } catch (error) {
        res.status(500).send({ error : error.message });
      }
      
      if (req.body.dry_run) {
        res.status(200).json(configuration);
      } else {
        res.status(200).end();
      }
  } else {
    res.status(400).json({ error: 'You need to provide a valid bot_type in your post body. Currently only "abotkit-core" is supported.' })
  }
});

app.post('/bot/handle', async (req, res) => {
  if (typeof req.body.bot_name === 'undefined') {
    return res.status(400).json({ error: 'You need to provid a bot name using bot_name in your request body'})
  }

  const sql = `SELECT name, host, port FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }

  axios.post(`${bot.host}:${bot.port}/handle`, { query: req.body.query }).then(response => {
    res.json(response.data);
  }).catch(error => {
    res.status(error.response.status).json({ error: error.response.data });
  });
});

app.post('/bot/explain', async (req, res) => {
  if (typeof req.body.bot_name === 'undefined') {
    return res.status(400).json({ error: 'You need to provid a bot name using bot_name in your request body'})
  }

  const sql = `SELECT name, host, port FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }

  axios.post(`${bot.host}:${bot.port}/explain`, { query: req.body.query }).then(response => {
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
      res.json(examples);
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

app.post('/intent', async (req, res) => {
  let sql = 'SELECT name, host, port FROM bots WHERE name=?';
  let params = [req.body.bot_name];
  let response = null;
  
  try {
    response = await executeSelectQuery(sql, params);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];

  if (typeof bot === 'undefined') {
    return res.status(404).json({ error: 'Bot not found.' });
  }
 
  sql = 'INSERT INTO intents (name, bot, action) SELECT ?, id, ? FROM bots WHERE name=?';
  params = [req.body.name, req.body.action_id, req.body.bot_name]

  try {
    await executeQuery(sql, params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  const intent = (await executeSelectQuery('SELECT i.id, a.name as action FROM intents i INNER JOIN actions a ON i.action=a.id WHERE i.name=?', [req.body.name]))[0];

  try {
    await axios.post(`${bot.host}:${bot.port}/actions`, { name: intent.action, intent: req.body.name, settings: {} });
  } catch (error) {
    console.warn(`Couldn't update core bot. Failed to push action to ${bot.host}:${bot.port}/actions` + error);
  }

  if (typeof req.body.examples !== 'undefined') {
    for (const example of req.body.examples) {
      const query = `INSERT INTO examples (intent, text) SELECT id, ? FROM intents WHERE name=?`;
      const params = [example, req.body.name];
      
      try {
        await executeQuery(query, params);
      } catch (error) {
        return res.status(400).json({ error: 'some examples could not be added: ' + error.message });
      }

      try {
        await axios.post(`${bot.host}:${bot.port}/example`, { example: example, intent: req.body.name });
      } catch (error) {
        console.warn(`Couldn't update core bot. Failed to push examples to ${bot.host}:${bot.port}/example` + error);
      }
    }
  } 

  res.status(200).json({ id: intent.id });
});

app.listen(3000, async () => {
  await initDatabase();
  console.log('A bot kit listening on port 3000!');
  const bot = (await executeSelectQuery('SELECT id, name, host, port FROM bots WHERE id=1'))[0];
  console.log(`Start baking and deploying the default bot ${bot.name} at ${bot.host}:${bot.port}.`);
  const configuration = await bakeCoreBot(bot.name);
  let response = {};
  try {
    response = await axios.post(`${bot.host}:${bot.port}/bots`, {configuration: configuration});
  } catch (error) {
    console.log(error.message);
  }
  
  if ( response.status === 200 ) {
    console.log('Successfully baked the bot. 🥧');
    console.log('Start uploading the brand new core bot');
    try {
      await axios.get(`${bot.host}:${bot.port}/bot/${bot.name}`);
      console.log('The default bot was deployed successfully 🦾');
    } catch (error) {
      console.warn('Something went wrong while loading the bot file.')
      console.error(error);
    }
  } else {
    console.warn('Something went wrong while uploading the new bot.')
    if (response.statusText) {
      console.error(response.statusText);
    } else {
      console.warn(`Check if your bot server is available at ${bot.host}:${bot.port}`);
    }
  }
});