import React, { useRef, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useConversation } from '@/Contexts/ConversationContext';

function Home({ selectedConversation = null, messages = null }) {   
    const { activeConversation, setActiveConversation } = useConversation();
    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const echoChannelRef = useRef(null);
    const page = usePage();
    const pageSelectedConversation = page.props.selectedConversation;
    
    // Manejar nuevos mensajes
    const handleNewMessage = (data) => {
        console.log("Nuevo mensaje recibido:", data);
        if (data && data.message) {
            // Verificar si el mensaje ya existe en la lista
            const messageExists = localMessages.some(msg => msg.id === data.message.id);
            
            if (!messageExists) {
                // Añadir el mensaje al estado local solo si no existe
                setLocalMessages(prevMessages => [...prevMessages, data.message]);
                
                // Scroll al final del chat
                setTimeout(() => {
                    if (messagesCtrRef.current){
                        messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
                    }
                }, 100);
            } else {
                console.log("Mensaje duplicado ignorado:", data.message.id);
            }
        }
    };
    
    // Si recibimos una conversación desde las props de la página, actualizar el contexto
    useEffect(() => {
        if (pageSelectedConversation && (!activeConversation || pageSelectedConversation.id !== activeConversation.id)) {
            setActiveConversation(pageSelectedConversation);
        }
    }, [pageSelectedConversation]);
    
    // Asegurarse de que usamos la conversación seleccionada de cualquier fuente disponible
    const currentConversation = selectedConversation || activeConversation || pageSelectedConversation;
    
    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current){
                messagesCtrRef.current.scrollTop = 
                messagesCtrRef.current.scrollHeight;
            }
        }, 10);
    }, [currentConversation]);

    useEffect(() => {
        if (messages && messages.data) {
            // La paginación devuelve los más recientes primero, invertimos para mostrar cronológicamente
            const sortedMessages = [...messages.data].reverse();
            setLocalMessages(sortedMessages);
            
            // Hacer scroll hacia abajo cuando cargan los mensajes
            setTimeout(() => {
                if (messagesCtrRef.current) {
                    messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
                }
            }, 100);
        } else {
            setLocalMessages([]);
        }
    }, [messages]);
    
    // Escuchar eventos de mensajes en tiempo real
    useEffect(() => {
        if (!currentConversation) return;
        
        // Limpiar cualquier suscripción anterior
        if (echoChannelRef.current) {
            try {
                // Evitar error si stopListening no existe
                if (echoChannelRef.current.name) {
                    window.Echo.leave(echoChannelRef.current.name);
                    console.log('Desuscribiendo del canal anterior:', echoChannelRef.current.name);
                }
            } catch (error) {
                console.error('Error al desuscribirse:', error);
            }
            echoChannelRef.current = null;
        }
        
        // Construir el nombre del canal basado en el tipo de conversación
        let channelName;
        if (currentConversation.is_group) {
            channelName = `message.group.${currentConversation.id}`;
        } else {
            // Para conversaciones de usuario a usuario, necesitamos ordenar los IDs para que coincida con el formato del servidor
            const user = page.props.auth.user;
            const ids = [user.id, currentConversation.id].sort((a, b) => a - b);
            channelName = `message.user.${ids.join('-')}`;
        }
        
        console.log('Suscribiendo al canal:', channelName);
        
        // Suscribirse al canal privado
        const channel = window.Echo.private(channelName)
            .listen('.message.sent', (data) => {
                // Ignorar eventos propios para evitar duplicación
                const userId = page.props.auth.user.id;
                if (data.message && data.message.sender_id === userId) {
                    console.log('Ignorando mensaje propio:', data);
                    return;
                }
                console.log('Mensaje recibido en canal:', data);
                handleNewMessage(data);
            });
        
        // Guardar referencia al canal (solo el nombre)
        echoChannelRef.current = { 
            name: channelName
        };
            
        // Limpiar suscripción al desmontar
        return () => {
            try {
                // Primero detenemos la escucha
                channel.stopListening('.message.sent');
                // Luego abandonamos el canal
                if (echoChannelRef.current && echoChannelRef.current.name) {
                    window.Echo.leave(echoChannelRef.current.name);
                    console.log('Desuscribiendo del canal:', echoChannelRef.current.name);
                }
            } catch (error) {
                console.error('Error al limpiar suscripción:', error);
            } finally {
                echoChannelRef.current = null;
            }
        };
    }, [currentConversation]);

    return (
        <>
            {!messages && !currentConversation && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Seleccionar una conversación para empezar a chatear
                    </div>
                    <ChatBubbleLeftRightIcon className="w-24 h-24 inline-block" />
                </div>
            )}
            {(messages || currentConversation) && (
                <div className="flex flex-col h-full">
                    {currentConversation && (
                        <div className="flex-shrink-0">
                            <ConversationHeader
                                selectedConversation={currentConversation}
                            />
                        </div>
                    )}
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-5 min-h-0"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {localMessages.length === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    Sin mensajes
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className='flex flex-col'>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {currentConversation && (
                        <div className="flex-shrink-0 sticky bottom-0 bg-slate-800 z-10">
                            <MessageInput conversation={currentConversation} onNewMessage={handleNewMessage} />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout>{page}</ChatLayout>
        </AuthenticatedLayout>
    );
};

export default Home;