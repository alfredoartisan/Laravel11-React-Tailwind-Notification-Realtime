
import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useRef, useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

function Home({ messages }) {

    const [loscalMessages, setLocalMessages] = useState([]);
    const messageCtrRef = useRef(null);

    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Seleccionar una conversación para empezar a chatear
                    </div>
                    <ChatBubbleLeftRightIcon className="w-24 h-24 inline-block" />

                </div>
            )}
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className='flex-1 overflow-y-auto p-5'
                    >
                        {localMessages.lenght === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    Sin mensajes
                                </div>
                            </div>
                        )}
                        {localMessages.lenght > 0 && (
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
                    <MessageInput conversation= {selectedConversation}/>
                </>
            )}
        </>
    )
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Home;