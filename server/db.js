const sqlite3 = require('sqlite3').verbose()
const config = require('./config.json');

const db = new sqlite3.Database(config.DATABASE_PATH, async error => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    console.log('Successfully connect to db.sqlite')
  }
});

const executeSelectQuery = ( query, params ) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

const executeQuery = ( query, params ) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    })
  });
}

const initDatabase = async () => {
  await executeQuery(`CREATE TABLE IF NOT EXISTS bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`)

  await executeQuery(`CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    bot INTEGER NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT 0,
    code text,
    FOREIGN KEY (bot) REFERENCES bots (id))`)

  await executeQuery(`CREATE TABLE IF NOT EXISTS intents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action INTEGER,
    bot INTEGER NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT UNIQUE NOT NULL,
    FOREIGN KEY (action) REFERENCES actions (id),
    FOREIGN KEY (bot) REFERENCES bots (id))`)
  
  await executeQuery(`CREATE TABLE IF NOT EXISTS examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intent INTEGER,
    text TEXT UNIQUE NOT NULL,
    FOREIGN KEY (intent) REFERENCES intents (id) ON DELETE CASCADE)`)

  await executeQuery(`CREATE TABLE IF NOT EXISTS phrases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intent INTEGER,
    text TEXT NOT NULL,
    FOREIGN KEY (intent) REFERENCES intents (id) ON DELETE CASCADE)`)

  const bots = await executeSelectQuery('SELECT id FROM bots');

  if (bots.length === 0) {
    await executeQuery(`INSERT INTO bots (name, host, port) VALUES ('Default Bot', 'http://localhost', 5000)`);

    const actions = [{
      'name': 'Shout',
      'active': 1
    }, {
      'name': 'Hackernews - Top Story',
      'active': 1
    }, {
      'name': 'Talk',
      'active': 1
    }];

    for (action of actions) {
      await executeQuery(`INSERT INTO actions (name, active, bot) VALUES ('${action.name}', ${action.active}, 1)`);
    }

    const intents = {
      'hello': {
        'examples': ['hi', 'Hello', 'hello', 'hi there'],
        'action': 3
      },
      'hn': {
        'examples': ['Hackernews', 'Hacker news', 'What is on Hackernews today?'],
        'action': 2
      },
      'shout': {
        'examples': ['Shout', 'Can you shout?'],
        'action': 1
      },
      'bye': {
        'examples': ['Bye', 'ciao', 'bye bye', 'see you'],
        'action': 3
      }          
    }

    const phrases = {
      "hello": [
        "Hello, world!",
        "Hello, friend. Hello, friend.",
        "Howdy",
        "What's up",
        "Yo",
        "Hello mister",
        "Doctor.",
        "How you doin?"
      ],
      "bye": [
        "Bye",
        "Talk to you later",
        "Have a nice day",
        "Take care",
        "Catch you later"
      ]
    }

    for (const intent of Object.keys(intents)) {
      await executeQuery(`INSERT INTO intents (name, action, bot) VALUES ('${intent}', ${intents[intent].action}, 1)`);
      for (const example of intents[intent].examples) {
        const query = `INSERT INTO examples (intent, text) SELECT id, '${example}' FROM intents WHERE name='${intent}'`;
        try {
          await executeQuery(query);
        } catch (error) {
          console.error(error);
        }
      }
    }

    for (const intent of Object.keys(phrases)) {
      for (const phrase of phrases[intent]) {
        const query = `INSERT INTO phrases (intent, text) SELECT id, ? FROM intents WHERE name=?`;
        const params = [phrase, intent]
        try {
          await executeQuery(query, params);
        } catch (error) {
          console.error(error);
        }        
      }
    }
  }
}

module.exports = {
  db: db,
  initDatabase: initDatabase,
  executeQuery: executeQuery,
  executeSelectQuery: executeSelectQuery
}