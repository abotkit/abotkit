# abotkit

abotkit enables you to build ai based chatbots without ai or programing skills.
These bots can react to custom or predefined actions. abotkit ships default
algorithms or action providers like gmail, google search, google calender,
Facebook or WhatsApp by default, but is also easy to customize.

## Prerequirements

* Nodejs 10+
* Python 3.5+

## Setup
```bash
git clone git@gitlab.com:abotkit/abotkit.git
cd abotkit
pip install -r requirements.txt

# to use the abotkit ui
cd ui
yarn # or npm install
yarn start # or npm run start
# ui is now running on port 21520 and backend will start on port 5000
```

# FAQ

## How do I deploy my bot?

You need a persisted bot (use the admin tool) and a server (CLI, Slack, ...).
Use the following script to start your bot:

```bash
python deploy.py ./bots/default.json ./servers/cli.json
```
