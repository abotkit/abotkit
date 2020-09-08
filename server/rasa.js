const path = require("path");
const fs = require("fs");
const yaml = require('js-yaml')
const md2json = require("md-2-json")
const folder = "../rasa";
const directory = path.join(__dirname, folder);

function parseExamples(x) {
  x = x.trim();
  x = x.split(/[\r\n]+/);
  x = x.map((y) => y.replace("- ", ""));
  return x;
}

function parseIntent(x) {
  return x.split("intent:")[1]
}

const readNLUMDData = (dir) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir);
    let intents = {};
    files
      .filter((file) => file === "data")
      .map((file) => {
        const file_data = fs.readFileSync(
          path.join(dir, file, "nlu.md"),
          "utf-8"
        );
        nlu_file = md2json.parse(file_data.toString());
        for (const key in nlu_file) {
          console.log("###")
          console.log(key)
          console.log(nlu_file[key])
          intents[parseIntent(key)] = {
            examples: parseExamples(nlu_file[key].raw),
            action: "Talk"
          }
          other_intents = Object.keys(nlu_file[key])
          other_intents.shift()
          for (const intent of other_intents) {
            intents[parseIntent(intent)] = {
              examples: parseExamples(nlu_file[key][intent].raw),
              action: "Talk"
            }
          }
        }
      });
    resolve(intents);
  });
};


const readNLUData = (dir) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir);
    let intents = {};
    files
      .filter((file) => file === "data")
      .map((file) => {
        const file_data = fs.readFileSync(
          path.join(dir, file, "nlu.yml"),
          "utf-8"
        );
        nlu_file = yaml.safeLoad(file_data);
        for (const key in nlu_file.nlu) {
          intents[nlu_file.nlu[key].intent] = {
            examples: parseExamples(nlu_file.nlu[key].examples),
            action: "Talk",
          };
        }
      });
    resolve(intents);
  });
};

const readPhrases = (dir) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir);
    let phrases = {};
    files
      .filter((file) => file === "domain.yml")
      .map((file) => {
        const file_data = fs.readFileSync(path.join(directory, file), "utf-8");
        domain_file = yaml.safeLoad(file_data);
        for (const key in domain_file.responses) {
          phrases[key] = domain_file.responses[key].map((value) => {
            return value.text;
          });
        }
      });
    resolve(phrases);
  });
};

module.exports = {
  rasaDirectory: directory,
  readNLUMDData: readNLUMDData,
  readPhrases: readPhrases,
};

//readPhrases(directory).then((result) => console.log(result));
//readNLUData(directory).then((result) => console.log(Object.keys(result)));
//readNLUMDData(directory).then((result) => console.log(result));
