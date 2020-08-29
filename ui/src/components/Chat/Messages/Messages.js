import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import './Messages.css';
import Message from '../Message/Message';

const Messages = ({ messages }) => (
    <ScrollToBottom>
        {[...messages.current].map((message, i) => <div key={i}><Message message={message} name={message.issuer} /></div>)}
    </ScrollToBottom>
);

export default Messages;