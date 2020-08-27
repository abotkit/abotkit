import React, { useState, useEffect, useCallback } from 'react';
import { notification, Breadcrumb, Collapse, Button, Modal, Input, Select, Tag, Divider } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'react-router-dom';
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
  },
  required: {
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
  },
  example: {
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    '& > span:last-child': {
      marginLeft: 6
    }
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
  const history = useHistory();

  const [intents, setIntents] = useState([]);
  const [intentName, setIntentName] = useState('');
  const [visible, setVisible] = useState(false);
  const [examples, setExamples] = useState([]);
  const [exampleText, setExampleText] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [phraseText, setPhraseText] = useState('');
  const [actions, setActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedNewAction, setSelectedNewAction] = useState('');
  const [newExampleTexts, setNewExampleTexts] = useState([]);
  const [intentPhrases, setIntentPhrases] = useState({});
  const [newPhrases, setNewPhrases] = useState([]);

  const fetchIntents = useCallback(async () => {
    try {
      const intents = (await axios.get(`http://localhost:3000/bot/${bot}/intents`)).data;
      const phrases = {};
      for (const intent of intents) {
        intent.examples = (await axios.get(`http://localhost:3000/intent/${intent.name}/examples`)).data;
        phrases[intent.name] = (await axios.get(`http://localhost:3000/intent/${intent.name}/phrases`)).data;
      }
      setIntents(intents);
      setIntentPhrases(phrases);
      setSelectedActions(intents.map(intent => intent.action));
      setNewExampleTexts([...Array(intents.length).keys()].map(() => ''))
      setNewPhrases([...Array(intents.length).keys()].map(() => ''))
    } catch (error) {
      console.warn('abotkit rest api is not available', error);
    }
  }, [bot]);

  const selectAction = (intent, action) => {
    const updates = [...selectedActions];
    updates[intent] = action;
    setSelectedActions(updates);
    // TODO: SEND UPDATE TO SERVER
  }

  useEffect(() => {
    axios.get(`http://localhost:3000/bot/${bot}/actions`).then(response => {
      const availableActions = response.data;
    
      setActions(availableActions);
      if (availableActions.length > 0) {
        setSelectedNewAction(availableActions[0].name)
      }
    }).catch(error => {
      console.warn('abotkit rest api is not available', error);
    });
  }, [bot]);

  useEffect(() => {
    axios.get(`http://localhost:3000/bot/${bot}/status`).then(() => {
      fetchIntents();
    }).catch(error => {
      if (typeof error.response !== 'undefined' && error.response.status === 404) {
        history.push('/not-found');
      } else {
        console.warn('abotkit rest api is not available', error);
      }
    });
  }, [fetchIntents, history, bot]);

  const removeExample = (event, text) => {
    event.preventDefault();
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

  const updateNewExampleTexts = (intent, example) => {
    const updates = [...newExampleTexts];
    updates[intent] = example;
    setNewExampleTexts(updates);
  }

  const addNewExample = async intent => {
    try {
      await axios.post('http://localhost:3000/example', { intent: intents[intent].name, example: newExampleTexts[intent] });
    } catch (error) {
      showNotification('Couldn\'t add example', error.message);
      return;
    }
    
    fetchIntents();
  }

  const removeExampleFromIntent = async example => {
    await axios.delete('http://localhost:3000/example', { data: { example: example } });
    fetchIntents();
  }

  const removePhrase = (event, text) => {
    event.preventDefault();
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

  const setNewPhrase = (intent, phrase) => {
    const updates = [...newPhrases];
    updates[intent] = phrase;
    setNewPhrases(updates);
  }

  const addNewPhrase = async intent => {
    try {
      await axios.post('http://localhost:3000/phrases', { bot_name: bot, phrases: [{ intentName: intents[intent].name, intentId: intents[intent].id, text: newPhrases[intent] }]});
    } catch (error) {
      showNotification('Couldn\'t add phrase', error.message);
      return;
    }
    
    fetchIntents();
  }

  const removeIntentPhrase = async (event, intent, phrase) => {
    event.preventDefault();
    try {
      await axios.delete('http://localhost:3000/phrase', { data: { intentName: intent.name, intentId: intent.id, phrase: phrase.text }});
    } catch (error) {
      showNotification('Couldn\'t add phrase', error.message);
      return;
    }
    
    fetchIntents();    
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

    let response;

    try {
      response = await axios.post('http://localhost:3000/intent', { action_id: actions.find(action => action.name === selectedNewAction).id, bot_name: bot, name: intentName, examples: examples });
    } catch (error) {
      showNotification('Couldn\'t add intent', error.message);
      return;
    }

    if ( selectedNewAction === 'Talk' ) {
      const intentId = response.data.id;
      await axios.post('http://localhost:3000/phrases', { bot_name: bot, phrases: phrases.map(phrase => ({ intentName: intentName, intentId: intentId, text: phrase })) });
    }
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

      { intents.length > 0 ? <Collapse style={{ marginTop: 16 }} defaultActiveKey={['0']}>
        { intents.map((intent, key) =>
          <Panel header={ intent.name } key={ key }>
            <h3>Action</h3>
            <Select value={selectedActions[key]} onChange={value => selectAction(key, value)} style={{ marginBottom: 12, minWidth: 200 }}>
              { actions.map((action, key) => <Option key={ key } value={ action.id }>{ action.name }</Option>) }
            </Select>
            { typeof selectedActions[key] !== 'undefined' && typeof actions[selectedActions[key] -  1] !== 'undefined' && actions[selectedActions[key] -  1].name === 'Talk' ? <>
              <div className={classes.input}>
                <span className={classes.label}>Answer:</span><Input value={newPhrases[key]} onChange={({ target: { value } }) => setNewPhrase(key, value)} placeholder="Another possibility for answering" />
                <Button className={classes.button} onClick={() => addNewPhrase(key)} type="primary" shape="circle" icon={<PlusOutlined />} />
              </div>
              <div>
                { typeof intentPhrases[intent.name] === 'undefined' ? null : intentPhrases[intent.name].map((phrase, index) => <Tag key={index} closable onClose={event => removeIntentPhrase(event, intent, phrase)}>{ phrase.text }</Tag>)}
              </div>
        </> : null}
            <h3>Examples</h3>
            <div className={classes.input}>
              <Input value={newExampleTexts[key]} onPressEnter={() => addNewExample(key)} onChange={({ target: { value } }) => updateNewExampleTexts(key, value)} placeholder="Another example for triggering this intent" />
              <Button className={classes.button} onClick={() => addNewExample(key)} type="primary" shape="circle" icon={<PlusOutlined />} />
            </div>

            { intent.examples.map((example, key) => <div key={ key } className={classes.example}><CloseCircleOutlined onClick={() => removeExampleFromIntent(example.text)} /><span>{ example.text }</span></div>) }
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
          <span className={`${classes.required} ${classes.label}`}>Name:</span><Input value={intentName} onChange={({ target: { value } }) => setIntentName(value)} placeholder="intent name" />
        </div>
        <div className={classes.input}>
          <span className={`${classes.required} ${classes.label}`}>Example:</span><Input value={exampleText} onChange={({ target: { value } }) => setExampleText(value)} placeholder="example text to trigger this intent" />
          <Button className={classes.button} onClick={addExample} type="primary" shape="circle" icon={<PlusOutlined />} />
        </div>
        <div>
          { examples.map((example, index) => <Tag key={index} closable onClose={event => removeExample(event, example)}>{ example }</Tag>) }
        </div>
        <Divider orientation="left">Action</Divider>
        <Select value={selectedNewAction} onChange={ value => setSelectedNewAction(value)} style={{ marginBottom: 12, minWidth: 200 }}>
          { actions.map((action, key) => <Option key={ key } value={ action.name }>{ action.name }</Option>) }
        </Select>
        
        { selectedNewAction === 'Talk' ? <>
          <div className={classes.input}>
            <span className={`${classes.required} ${classes.label}`}>Answer:</span><Input value={phraseText} onChange={({ target: { value } }) => setPhraseText(value)} placeholder="A simple text answer" />
            <Button className={classes.button} onClick={addPhrase} type="primary" shape="circle" icon={<PlusOutlined />} />
          </div>
          <div>
            { phrases.map((phrase, index) => <Tag key={index} closable onClose={event => removePhrase(event, phrase)}>{ phrase }</Tag>) }
          </div>
        </> : null }
      </Modal>
    </>
  );
}

export default Intents;