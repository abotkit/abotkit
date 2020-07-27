const express = require('express');
const app = express();
const db = require('./db.js');
const { spawn } = require('child_process');
const fs = require('fs')

try {
  if (!fs.existsSync('./config.json')) {
    console.log('Please use the setup script first. Go to the abotkit root dir and run `./setup.sh`');
    process.exit();
  }
} catch(error) {
  console.error(error);
}

const config = require('./config.json')

app.use(express.json());

const convertToLowerSnakeCase = text => {
  return text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(sign => sign.toLowerCase()).join('_');
}

app.get('/', (req, res) => {
  res.send('abotkit is up and running!');
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

app.post('/talk', (req, res) => {
  res.json({ message: 'TODO: Ask a bot' });
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

  try {
    const flask = spawn(config.python, ['../botkit/app.py']);

    let processRunnning = true;
    flask.stdout.on('data', (data) => {
      console.log(`botkit: ${data}`);
    });
    
    flask.stderr.on('data', (data) => {
      console.error(`botkit: ${data}`);
    });

    flask.on('exit', () => { 
      processRunnning = false;
    });

    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(event => {
      process.on(event, message => {
        if (!['SIGINT', 'SIGTERM'].includes(message)) {
          console.error(message);
        }

        if (processRunnning) {
          processRunnning = false;
          flask.stdin.pause();
          flask.kill();
          console.log('Shutdown flask server as well. Bye 🤖')
        }
        process.exit();
      });
    });
  } catch (error) {
    console.log(error);
  }
});