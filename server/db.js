var sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('db.sqlite3', error => {
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
  }
});

module.exports = db