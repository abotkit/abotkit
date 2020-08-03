const sqlite3 = require('sqlite3').verbose()
const config = require('./config.json');
const fs = require('fs');

let insertExamples = false;
if (!fs.existsSync(config.DATABASE_PATH)) {
  insertExamples = true;
}


const db = new sqlite3.Database(config.DATABASE_PATH, async error => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    console.log('Successfully connect to db.sqlite')
    db.run(`CREATE TABLE IF NOT EXISTS actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      active BOOLEAN NOT NULL DEFAULT 0,
      code text)`, error => {
        if (error) {
          console.error(error.message);
          throw error;
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS intents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action INTEGER,
        created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name text,
        FOREIGN KEY (action) REFERENCES actions (id))`, error => {
          if (error) {
            console.error(error.message);
            throw error;
          }
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      intent INTEGER,
      text text,
      FOREIGN KEY (intent) REFERENCES intents (id) ON DELETE CASCADE)`, error => {
        if (error) {
          console.error(error.message);
          throw error;
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS phrases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      intent INTEGER,
      text text,
      FOREIGN KEY (intent) REFERENCES intents (id) ON DELETE CASCADE)`, error => {
        if (error) {
          console.error(error.message);
          throw error;
        }
    });

    if (insertExamples) {
      const intents = {
        'hello': ['hi', 'Hello', 'hello', 'hi there'],
        'hn': ['Hackernews', 'Hacker news', 'What is on Hackernews today?'],
        'shout': ['Shout', 'Can you shout?'],
        'bye': ['Bye', 'ciao', 'bye bye', 'see you']
      }

      for (intent of Object.keys(intents)) {
        await executeQuery(`INSERT INTO intents (name) VALUES ('${intent}')`);
        for (example of intents[intent]) {
          const query = `INSERT INTO examples (intent, text) SELECT id, '${example}' FROM intents WHERE name='${intent}'`;
          try {
            await executeQuery(query);
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  }
});

const executeSelectQuery = query => {
  return new Promise((resolve, reject) => {
    db.all(query, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

const executeQuery = query => {
  return new Promise((resolve, reject) => {
    db.run(query, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    })
  });
}

module.exports = {
  db: db,
  executeQuery: executeQuery,
  executeSelectQuery: executeSelectQuery
}