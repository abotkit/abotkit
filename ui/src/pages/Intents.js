import React, { useState, useEffect } from 'react';
import { notification, Breadcrumb, Collapse, Button, Modal, Input, Select, Tag, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { createUseStyles } from 'react-jss';

const { Panel } = Collapse;
const { Option } = Select;

const useStyles = createUseStyles({
  input: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    flex: '0 0 16%',
    '&:before': {
      display: 'inline-block',
      marginRight: 4,
      color: '#ff4d4f',
      fontSize: 14,
      fontFamily: 'SimSun, sans-serif',
      lineHeight: 1,
      content: '"*"'
    }
  },
  button: {
    marginLeft: 6
  }
});

const showNotification = (headline, message='', type='warning') => {
  notification[type]({
    message: headline,
    description: message,
  });
};

const Intents = () => {  
  const classes = useStyles();
  const { bot } = useParams();

  const [intents, setIntents] = useState([]);
  const [intentName, setIntentName] = useState('');
  const [visible, setVisible] = useState(false);
  const [examples, setExamples] = useState([]);
  const [exampleText, setExampleText] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [phraseText, setPhraseText] = useState('');
  const [selectedAction, setSelectedAction] = useState('talk');

  const fetchIntents = () => {
    axios.get(`http://localhost:3000/bot/${bot}/intents`).then(response => {
      setIntents(response.data.intents);
    }).catch(error => {
      console.warn('abotkit rest api is not available', error);
    });
  }

  useEffect(() => {
    fetchIntents();
  }, []);

  const removeExample = text => {
    setExamples(examples.filter(example => example !== text));
  }

  const addExample = () => {
    if (exampleText === '') {
      showNotification('Couldn\'t add example', 'The example text should not be empty.');
      return;
    }

    if (examples.includes(exampleText)) {
      showNotification('Couldn\'t add example', 'This example is already included in the example list.');
      return;
    }

    setExamples([...examples, exampleText]);
    setExampleText('');
  }

  const removePhrase = text => {
    setPhrases(phrases.filter(phrase => phrase !== text));
  }

  const addPhrase = () => {
    if (phraseText === '') {
      showNotification('Couldn\'t add phrase', 'The phrase text should not be empty.');
      return;
    }

    if (phrases.includes(phraseText)) {
      showNotification('Couldn\'t add phrase', 'This phrase is already included in the phrase list.');
      return;
    }

    setPhrases([...phrases, phraseText]);
    setPhraseText('');
  }

  const closeModal = () => {
    setVisible(false);
    setPhrases([]);
    setPhraseText('');
    setExamples([]);
    setExampleText('');
    setIntentName('');
  }

  const addIntent = async () => {
    if (intentName === '') {
      showNotification('Couldn\'t add intent', 'The intent name should not be empty.');
      return;      
    }

    if (examples.length < 2) {
      showNotification('Couldn\'t add intent', 'You need to provide at least 2 examples.');
      return;       
    }

    try {
      await axios.post('http://localhost:3000/intent', { name: intentName, examples: examples });
    } catch (error) {
      showNotification('Couldn\'t add intent', error.message);
      return;
    }
    
    /*
    TODO: add phrase handling in server
    
    if (selectedAction === 'talk') {

    }
    */

    closeModal();
    fetchIntents();
  }

  return (
    <>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>Intents</Breadcrumb.Item>
      </Breadcrumb>
      <h1>Intents</h1>
      <Button onClick={() => setVisible(true)} type="primary" shape="round" icon={<PlusOutlined />}>Add intent</Button>

      { intents.length > 0 ? <Collapse style={{ marginTop: 16 }} defaultActiveKey={['1']}>
        { intents.map((intent, key) =>
          <Panel header={ intent.name } key={ key }>
            <p>Examples</p>
          </Panel>
        )}
      </Collapse> : null }
      <Modal
        title="Add intent"
        visible={visible}
        onOk={() => addIntent()}
        onCancel={closeModal}
      >
        <div className={classes.input}>
          <span className={classes.label}>Name:</span><Input value={intentName} onChange={({ target: { value } }) => setIntentName(value)} placeholder="intent name" />
        </div>
        <div className={classes.input}>
          <span className={classes.label}>Example:</span><Input value={exampleText} onChange={({ target: { value } }) => setExampleText(value)} placeholder="example text to trigger this intent" />
          <Button className={classes.button} onClick={addExample} type="primary" shape="circle" icon={<PlusOutlined />} />
        </div>
        <div>
          { examples.map((example, index) => <Tag key={index} closable onClose={() => removeExample(example)}>{ example }</Tag>) }
        </div>
        <Divider orientation="left">Action</Divider>
        <Select value={selectedAction} onChange={({ target: { value } }) => setSelectedAction(value)} style={{ marginBottom: 12 }}>
          <Option value="talk">Talk</Option>
        </Select>
        <div className={classes.input}>
          <span className={classes.label}>Answer:</span><Input value={phraseText} onChange={({ target: { value } }) => setPhraseText(value)} placeholder="A simple text answer" />
          <Button className={classes.button} onClick={addPhrase} type="primary" shape="circle" icon={<PlusOutlined />} />
        </div>
        <div>
          { phrases.map((phrase, index) => <Tag key={index} closable onClose={() => removePhrase(phrase)}>{ phrase }</Tag>) }
        </div>
      </Modal>
    </>
  );
}

export default Intents;