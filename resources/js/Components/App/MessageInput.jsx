import React, { useState } from 'react';
import axios from 'axios';
import {
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Import the spinner icon
import NewMessageInput from "./NewMessageInput";

const MessageInput = ({ conversation, onNewMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);

    const onSendClick = () => {
        if (!conversation) {
            setInputErrorMessage('No hay conversación seleccionada');
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
            return;
        }

        if (newMessage.trim() === '') {
            setInputErrorMessage('Escriba un mensaje o suba archivo');
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
            return;
        }

        const formData = new FormData();
        formData.append('message', newMessage);
        if (conversation.is_user) {
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }
        setMessageSending(true);

        axios.post(route("message.store"), formData, {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                );
                console.log(progress);
            },
        }).then((response) => {
            setNewMessage('');
            setMessageSending(false);
            // Procesar mensaje localmente para mostrar inmediatamente sin depender del evento websocket
            if (onNewMessage) onNewMessage(response.data);
            console.log('Mensaje enviado con éxito:', response.data);
        }).catch((error) => {
            setMessageSending(false);
            console.error('Error al enviar mensaje:', error);
            setInputErrorMessage('Error al enviar el mensaje. Inténtalo de nuevo.');
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
        });
    }

    return (
        <div className="flex flex-wrap items-start border-t border-slate-700 py-3 bg-slate-800 w-full">
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2 flex items-center">
                <button className='p-1 text-gray-400 hover:text-gray-200 relative'>
                    <PaperClipIcon className="w-6" />
                    <input 
                        type="file"
                        multiple
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className='p-1 text-gray-400 hover:text-gray-200 relative'>
                    <PhotoIcon className="w-6" />
                    <input 
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    /> 
                </button>
            </div>
            <div className='order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative flex items-center'>
                <NewMessageInput 
                    value={newMessage}
                    onSend={onSendClick}
                    onChange={(ev) => setNewMessage(ev.target.value)}
                />
                <button
                    onClick={onSendClick}
                    className='btn btn-info rounded-l-none flex items-center ml-2'
                >
                    {messageSending && (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" /> // Use the spinner icon with animation
                    )}
                    <PaperAirplaneIcon className="w-6" />
                    <span className='hidden sm:inline'>Send</span>
                </button>
            </div>
            {inputErrorMessage && (
                <div className="absolute -top-10 left-0 right-0 bg-red-500 text-white p-2 rounded text-sm">
                    {inputErrorMessage}
                </div>
            )}
            <div className="order-3 flex flex-inline items-center mt-2">
                <button className='p-1 text-gray-400 hover:text-gray-300'>
                    <FaceSmileIcon className='w-6 h-6' />
                </button>
                <button className='p-1 text-gray-400 hover:text-gray-300'>
                    <HandThumbUpIcon className='w-6 h-6' />
                </button>
            </div>
            {inputErrorMessage && (
                <p className='text-xs text-red-400 order-4 w-full text-center mt-2'>{inputErrorMessage}</p>
            )}
        </div>
    );
};

export default MessageInput;