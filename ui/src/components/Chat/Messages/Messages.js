import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import './Messages.css';
import ChatViewComponent from '../Message/Message';

const Messages = ({ messages }) => (
    <ScrollToBottom>
        {[...messages.current].map((message, i) => <div key={i}><ChatViewComponent message={message} /></div>)}
    </ScrollToBottom>
);

export default Messages;