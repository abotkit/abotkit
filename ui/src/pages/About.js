import React, { useState } from 'react';
import { Layout, Button, Input } from 'antd';
import { RocketOutlined, HomeOutlined } from '@ant-design/icons';
import { createUseStyles } from 'react-jss';
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <h3 className={ classes.headline }>{ t('about.project.headline') }</h3>
        <p>{t('about.project.text')}</p>
        <h3 className={ classes.headline }>{ t('about.start.headline') }</h3>
        <p>{ t('about.start.text') }</p>
        <div className={ classes.input }>
          <Input disabled value={botname} onChange={event => setBotname(event.target.value)} placeholder={ t('about.start.placeholder') } />
          <Button disabled onClick={() => visit(botname)} type="primary" icon={<RocketOutlined />}>{ t('about.start.button') }</Button>
        </div>
        <h3 className={ classes.headline }>{ t('about.restore.headline') }</h3>
        <p>{ t('about.restore.text') }</p>
        <div className={ classes.input }>
          <Input onPressEnter={() => visit(existingBotname)} value={existingBotname} onChange={event => setExistingBotname(event.target.value)} placeholder={ t('about.restore.placeholder') } />
          <Button onClick={() => visit(existingBotname)} type="primary" icon={<HomeOutlined />}>{ t('about.restore.button') }</Button>
        </div>
        <h3 className={ classes.headline }>{ t('about.contribute.headline') }</h3>
        <p>{ t('about.contribute.text') } <a href="https://github.com/abotkit/abotkit">{ t('about.contribute.link') }</a></p>
      </Content>
      <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
    </>
  );
}

export default About;