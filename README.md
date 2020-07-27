# abotkit

abotkit enables you to build ai based chatbots without ai or programing skills. 
You can develop your bot simply by chatting with it. These bots can react to custom or predefined actions. 
abotkit ships default algorithms or action providers like gmail, google search, google calender,
Facebook or WhatsApp by default, but is also easy to customize.

## Prerequirements

* Nodejs 10+
* Python 3.7+

## Setup

```bash
git clone git@gitlab.com:abotkit/abotkit.git
cd abotkit
chmod +x setup.sh
./setup.sh

# to use the abotkit ui
cd ui
npm start
# ui is now running on port 21520
cd ../server
npm start
# backend is now running on port 3000 and bot server is going to start at port 5000
```
