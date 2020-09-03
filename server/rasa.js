const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const folder = "../rasa";
const directory = path.join(__dirname, folder);

function parseExamples(x) {
  x = x.trim();
  x = x.split(/[\r\n]+/);
  x = x.map((y) => y.replace("- ", ""));
  return x;
}

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
  readNLUData: readNLUData,
  readPhrases: readPhrases,
};

//readPhrases(directory).then((result) => console.log(result));
//readNLUData(directory).then((result) => console.log(Object.keys(result)));
