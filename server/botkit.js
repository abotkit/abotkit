const express = require("express");
const app = express();
const {
  db,
  initDatabase,
  executeQuery,
  executeSelectQuery,
} = require("./db.js");
const cors = require("cors");
const axios = require("axios").default;
app.use(express.json());
app.use(cors());

const getBotByIntent = async (intent) => {
  const sql =
    "SELECT b.name, b.host, b.port FROM intents i INNER JOIN bots b ON i.bot=b.id WHERE i.name=?";
  const params = [intent];
  try {
    response = await executeSelectQuery(sql, params);
  } catch (error) {
    throw error;
  }

  return response[0];
};

app.get("/bots", async (req, res) => {
  const sql = "SELECT id, name FROM bots";
  try {
    const bots = await executeSelectQuery(sql);
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get("/bot/:name/status", async (req, res) => {
  const sql = "SELECT name, host, port FROM bots WHERE name=?";
  let response = null;
  try {
    response = await executeSelectQuery(sql, [req.params.name]);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  try {
    await axios.get(`${bot.host}:${bot.port}/`);
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/bot/:name/settings", async (req, res) => {
  try {
    const sql = "SELECT name, host, port FROM bots WHERE name=?";
    const bot = (await executeSelectQuery(sql, [req.params.name]))[0];

    if (typeof bot !== "undefined") {
      res.json(bot);
    } else {
      res.status(404).json({ error: "Bot not found." });
    }
  } catch (error) {
    res.status(500).send();
  }
});

app.get("/bot/:name/actions", async (req, res) => {
  const sql =
    "SELECT a.id, a.name, a.description, a.active, a.code FROM actions a INNER JOIN bots b ON a.bot=b.id WHERE b.name=? ORDER BY a.id";
  let response = null;
  try {
    response = await executeSelectQuery(sql, [req.params.name]);
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/action", (req, res) => {
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

app.get("/phrases", (req, res) => {
  const sql = "SELECT * FROM phrases";
  db.all(sql, (error, phrases) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ phrases });
    }
  });
});

app.get("/intent/:intent/phrases", async (req, res) => {
  const sql =
    "SELECT p.* FROM phrases p INNER JOIN intents i ON p.intent=i.id WHERE i.name=?";
  let phrases;
  try {
    phrases = await executeSelectQuery(sql, [req.params.intent]);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  res.json(phrases);
});

app.delete("/phrase", async (req, res) => {
  let sql =
    "SELECT b.host, b.port FROM intents i INNER JOIN bots b ON i.bot=b.id WHERE i.id=?";
  let response = null;
  const params = [req.body.intentId];

  try {
    response = await executeSelectQuery(sql, params);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];

  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "example not found" });
  }

  sql = "DELETE FROM phrases WHERE text=? AND intent=?";
  try {
    await executeQuery(sql, [req.body.phrase, req.body.intentId]);
    await axios.delete(`${bot.host}:${bot.port}/phrases`, {
      data: {
        phrases: [{ intent: req.body.intentName, text: req.body.phrase }],
      },
    });
    res.status(200).end();
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/phrases", async (req, res) => {
  let sql = `INSERT INTO phrases (intent, text) VALUES (?, ?)`;

  try {
    for (const params of req.body.phrases.map((phrase) => [
      phrase.intentId,
      phrase.text,
    ])) {
      await executeQuery(sql, params);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  sql = "SELECT name, host, port FROM bots WHERE name=?";
  let response = null;
  try {
    response = await executeSelectQuery(sql, [req.body.bot_name]);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  try {
    await axios.post(`${bot.host}:${bot.port}/phrases`, {
      phrases: req.body.phrases.map((phrase) => ({
        text: phrase.text,
        intent: phrase.intentName,
      })),
    });
  } catch (error) {
    return res.status(500).json(error);
  }

  res.status(200).end();
});

app.get("/intents", (req, res) => {
  const sql = "SELECT * FROM intents ORDER BY id";
  db.all(sql, (error, intents) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ intents });
    }
  });
});

app.get("/bot/:name/intents", (req, res) => {
  const sql = `SELECT i.id, i.bot, i.action, i.created, i.name FROM intents i INNER JOIN bots b ON i.bot=b.id WHERE b.name='${req.params.name}' ORDER BY i.id`;
  db.all(sql, (error, intents) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(intents);
    }
  });
});

app.post("/intent/action", (req, res) => {
  const sql = `UPDATE intents SET action=${req.body.action} WHERE intents.id=${req.body.intent}`;
  db.run(sql, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).end();
    }
  });
});

const bakeCoreBot = async (botname) => {
  const configuration = {};
  configuration.name = botname;
  configuration.core = {
    name: "transformer",
    intents: {},
  };
  configuration.actions = [];
  configuration.phrases = {};

  const actions = await executeSelectQuery("SELECT name, active from actions");
  for (const action of actions) {
    configuration.actions.push({
      name: action.name,
      active: action.active === 1 ? { intents: [] } : false,
    });
  }

  try {
    const intents = await executeSelectQuery(
      "SELECT i.id, i.name, a.name as action FROM intents i INNER JOIN actions a ON i.action=a.id WHERE i.bot = (SELECT id FROM bots WHERE name = ?) ORDER BY i.id",
      [botname]
    );
    for (const intent of intents) {
      configuration.actions
        .find(
          (action) =>
            action.name === intent.action && typeof action.active === "object"
        )
        .active.intents.push(intent.name);
      const examples = await executeSelectQuery(
        `SELECT e.text, i.name FROM examples e INNER JOIN intents i ON e.intent=i.id WHERE e.intent='${intent.id}'`
      );
      for (const example of examples) {
        configuration.core.intents[example.text] = example.name;
      }
      const phrases = await executeSelectQuery(
        "SELECT text FROM phrases WHERE intent=?",
        [intent.id]
      );
      for (const phrase of phrases) {
        if (typeof configuration.phrases[intent.name] === "undefined") {
          configuration.phrases[intent.name] = [phrase.text];
        } else {
          configuration.phrases[intent.name].push(phrase.text);
        }
      }
    }
  } catch (error) {
    throw error;
  }

  return configuration;
};

app.post("/bot/bake", async (req, res) => {
  if (typeof req.body.bot_name === "undefined") {
    return res.status(400).json({
      error:
        "You need to provid a bot name using bot_name in your request body",
    });
  }

  const sql = `SELECT name, host, port FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null;
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  if (
    req.body.bot_type === "abotkit-core" ||
    req.body.bot_type === "rasa-core"
  ) {
    let configuration = {};
    try {
      configuration = await bakeCoreBot(req.body.bot_name);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }

    if (req.body.dry_run) {
      res.status(200).json(configuration);
    } else {
      res.status(200).end();
    }
  } else {
    res.status(400).json({
      error:
        'You need to provide a valid bot_type in your post body. Currently only "abotkit-core" is supported.',
    });
  }
});

app.post("/bot/handle", async (req, res) => {
  if (typeof req.body.bot_name === "undefined") {
    return res.status(400).json({
      error:
        "You need to provid a bot name using bot_name in your request body",
    });
  }

  const sql = `SELECT name, host, port, type FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null;
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  let endpoint;
  const data = {};
  if (bot.type === "abotkit") {
    endpoint = "handle";
    data.query = req.body.query;
    data.identifier = req.body.identifier;
  } else if (bot.type === "rasa") {
    endpoint = "webhooks/rest/webhook";
    data.message = req.body.query;
    data.sender = req.body.identifier;
  } else {
    return res.status(400).json({ error: "Undefined bot type." });
  }

  axios
    .post(`${bot.host}:${bot.port}/${endpoint}`, data)
    .then((response) => {
      console.log(response);
      // todo: Determine same response format for botkit and rasa -> rasa return array of objects
      // botkit returns only object
      if (bot.type === "abotkit") {
        res.json(response.data);
      } else if (bot.type === "rasa") {
        // quickwind -> return first entry in responses -> TODO: oresent multiple responses in chat
        //TODO: Handle stufflike buttons etc.
        res.json(response.data[0]);
      }
    })
    .catch((error) => {
      res.status(error.response.status).json({ error: error.response.data });
    });
});

app.post("/bot/explain", async (req, res) => {
  if (typeof req.body.bot_name === "undefined") {
    return res.status(400).json({
      error:
        "You need to provid a bot name using bot_name in your request body",
    });
  }

  const sql = `SELECT name, host, port FROM bots WHERE name='${req.body.bot_name}'`;
  let response = null;
  try {
    response = await executeSelectQuery(sql);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];
  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  axios
    .post(`${bot.host}:${bot.port}/explain`, { query: req.body.query })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).json({ error: error.response.data });
    });
});

app.get("/intent/:intent/examples", async (req, res) => {
  const sql =
    "SELECT e.* FROM examples e INNER JOIN intents i ON e.intent=i.id WHERE i.name=?";
  let examples;

  try {
    examples = await executeSelectQuery(sql, [req.params.intent]);
  } catch (error) {
    return res.status(500).json(error);
  }

  res.json(examples);
});

app.post("/example", async (req, res) => {
  const sql =
    "INSERT INTO examples (intent, text) SELECT id, ? FROM intents WHERE name=?";
  const params = [req.body.example, req.body.intent];
  console.log(sql, params);
  let bot;
  try {
    await executeQuery(sql, params);
    bot = await getBotByIntent(req.body.intent);
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  if (typeof bot === "undefined") {
    return res
      .status(404)
      .json({ error: "Failed to update bot. Intent related bot not found." });
  }
  console.log(bot);

  try {
    await axios.post(`${bot.host}:${bot.port}/example`, {
      example: req.body.example,
      intent: req.body.intent,
    });
    res.status(200).end();
  } catch (error) {
    console.warn(
      `Couldn't update core bot. Failed to push examples to ${bot.host}:${bot.port}/example` +
        error
    );
    res.status(500).json({ error: error });
  }
});

app.delete("/example", async (req, res) => {
  let sql =
    "SELECT b.host, b.port FROM examples e INNER JOIN intents i ON e.intent=i.id INNER JOIN bots b ON i.bot=b.id WHERE e.text=?";
  let response = null;
  const params = [req.body.example];

  try {
    response = await executeSelectQuery(sql, params);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];

  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "example not found" });
  }

  sql = "DELETE FROM examples WHERE text=?";
  try {
    await executeQuery(sql, params);
    await axios.delete(`${bot.host}:${bot.port}/example`, {
      data: { example: req.body.example },
    });
    res.status(200).end();
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/intent", async (req, res) => {
  let sql = "SELECT name, host, port FROM bots WHERE name=?";
  let params = [req.body.bot_name];
  let response = null;

  try {
    response = await executeSelectQuery(sql, params);
  } catch (error) {
    res.status(500).json(error);
  }

  const bot = response[0];

  if (typeof bot === "undefined") {
    return res.status(404).json({ error: "Bot not found." });
  }

  sql =
    "INSERT INTO intents (name, bot, action) SELECT ?, id, ? FROM bots WHERE name=?";
  params = [req.body.name, req.body.action_id, req.body.bot_name];

  try {
    await executeQuery(sql, params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  const intent = (
    await executeSelectQuery(
      "SELECT i.id, a.name as action FROM intents i INNER JOIN actions a ON i.action=a.id WHERE i.name=?",
      [req.body.name]
    )
  )[0];

  try {
    await axios.post(`${bot.host}:${bot.port}/actions`, {
      name: intent.action,
      intent: req.body.name,
      settings: {},
    });
  } catch (error) {
    console.warn(
      `Couldn't update core bot. Failed to push action to ${bot.host}:${bot.port}/actions` +
        error
    );
  }

  if (typeof req.body.examples !== "undefined") {
    for (const example of req.body.examples) {
      const query = `INSERT INTO examples (intent, text) SELECT id, ? FROM intents WHERE name=?`;
      const params = [example, req.body.name];

      try {
        await executeQuery(query, params);
      } catch (error) {
        return res.status(400).json({
          error: "some examples could not be added: " + error.message,
        });
      }

      try {
        await axios.post(`${bot.host}:${bot.port}/example`, {
          example: example,
          intent: req.body.name,
        });
      } catch (error) {
        console.warn(
          `Couldn't update core bot. Failed to push examples to ${bot.host}:${bot.port}/example` +
            error
        );
      }
    }
  }

  res.status(200).json({ id: intent.id });
});

app.listen(3000, async () => {
  await initDatabase();
  console.log("A bot kit listening on port 3000!");
  const bot = (
    await executeSelectQuery("SELECT id, name, host, port FROM bots WHERE id=1")
  )[0];
  console.log(
    `Start baking and deploying the default bot ${bot.name} at ${bot.host}:${bot.port}.`
  );
  const configuration = await bakeCoreBot(bot.name);
  let response = {};
  try {
    response = await axios.post(`${bot.host}:${bot.port}/bots`, {
      configuration: configuration,
    });
  } catch (error) {
    console.log(error.message);
  }

  if (response.status === 200) {
    console.log("Successfully baked the bot. 🥧");
    console.log("Start uploading the brand new core bot");
    try {
      await axios.get(`${bot.host}:${bot.port}/bot/${bot.name}`);
      console.log("The default bot was deployed successfully 🦾");
    } catch (error) {
      console.warn("Something went wrong while loading the bot file.");
      console.error(error);
    }
  } else {
    console.warn("Something went wrong while uploading the new bot.");
    if (response.statusText) {
      console.error(response.statusText);
    } else {
      console.warn(
        `Check if your bot server is available at ${bot.host}:${bot.port}`
      );
    }
  }

  const rasa_bot = (
    await executeSelectQuery("SELECT id, name, host, port FROM bots WHERE id=2")
  )[0];
  if (rasa_bot !== "undefined") {
    console.log(
      `Start baking and deploying the default rasa bot ${rasa_bot.name} at ${rasa_bot.host}:${rasa_bot.port}.`
    );
    const configuration = await bakeCoreBot(rasa_bot.name);
    console.log(configuration);
    //what to do with this configuration -> next steps?
  }
});
