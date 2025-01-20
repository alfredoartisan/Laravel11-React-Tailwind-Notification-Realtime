import React, { useState } from 'react';
import axios from 'axios';

const MessageInput = ({ conversation, onNewMessage }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        // Lógica para enviar el mensaje
        axios.post(route('messages.send', conversation.id), { message })
            .then(response => {
                onNewMessage(response.data.message);
                setMessage('');
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="p-4 border-t border-gray-200">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="w-full p-2 border rounded"
            />
            <button onClick={handleSendMessage} className="mt-2 p-2 bg-blue-500 text-white rounded">
                Enviar
            </button>
        </div>
    );
};

export default MessageInput;