import React, { useState } from 'react';
import { Layout, Button, Input } from 'antd';
import { RocketOutlined, HomeOutlined } from '@ant-design/icons';
import { createUseStyles } from 'react-jss';
import { useHistory } from "react-router-dom";
const { Header, Content, Footer } = Layout;

const useStyles = createUseStyles({
  title: {
    color: 'white',
    display: 'flex',
    justifyContent: 'center'
  },
  headline: {
    margin: '1.5em 0'
  },
  input: {
    display: 'flex'
  }
})

const About = () => {
  const classes = useStyles();
  const [botname, setBotname] = useState('');
  const [existingBotname, setExistingBotname] = useState('');
  const history = useHistory();

  const visit = bot => {
    history.push(`/${bot}/chat`);
  }

  return(
    <>
      <Header>
        <div className="logo" />
        <h3 className={ classes.title }>Abotkit</h3>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <h3 className={ classes.headline }>What is abotkit?</h3>
        <p>Abotkit is an open source project which aims to be an interface 
          between state of the art techniques and established chat bot frameworks to allow users without
          programming or ai skills to build an own chatbot just while chatting with it. 
          These bots can react to custom or predefined actions.
          abotkit ships default algorithms or action providers like gmail, google search, google calender,
          Facebook or WhatsApp by default, but is also easy to customize.
        </p>
        <h3 className={ classes.headline }>Getting Started</h3>
        <p>You can simply create your own bot right now. What would you like to call your bot?</p>
        <div className={ classes.input }>
          <Input value={botname} onChange={event => setBotname(event.target.value)} placeholder="A creative bot name" />
          <Button onClick={() => visit(botname)} type="primary" icon={<RocketOutlined />}>Create</Button>
        </div>
        <h3 className={ classes.headline }>Already have a bot?</h3>
        <p>You already have a bot? What's the name of your bot? I can take you there.</p>
        <div className={ classes.input }>
          <Input value={existingBotname} onChange={event => setExistingBotname(event.target.value)} placeholder="Your bot name" />
          <Button onClick={() => visit(existingBotname)} type="primary" icon={<HomeOutlined />}>Visit</Button>
        </div>
        <h3 className={ classes.headline }>Start Contributing</h3>
        <p>Abotkit is an open source framework currently being developed on GitLab under an MIT license. 
          Please feel free to <a href="https://gitlab.com/abotkit/abotkit">check it out.</a></p>
      </Content>
      <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
    </>
  );
}

export default About;