import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import ConversationItem from "@/Components/App/ConversationItem";
import TextInput from "@/Components/TextInput";
import { PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import ConversationHeader from "@/Components/App/ConversationHeader";
import { useConversation } from '@/Contexts/ConversationContext';

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations || [];
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { activeConversation, setActiveConversation } = useConversation();
    
    // Sincronizar selectedConversation con el contexto si existe
    useEffect(() => {
        if (selectedConversation && (!activeConversation || selectedConversation.id !== activeConversation.id)) {
            setActiveConversation(selectedConversation);
        }
    }, [selectedConversation]);

    const isUserOnline = (userId) => onlineUsers.hasOwnProperty(userId);

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.updated_at && b.updated_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.updated_at) {
                    return 1;
                } else if (b.updated_at) {
                    return -1;
                }
                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(a.last_message_date);
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                }
                return 0;
            })
        );
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        window.Echo.join('online')
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(users.map((user) => [user.id, user]));
                setOnlineUsers(onlineUsersObj);
            })
            .joining((user) => {
                setOnlineUsers((prev) => ({ ...prev, [user.id]: user }));
            })
            .leaving((user) => {
                setOnlineUsers((prev) => {
                    const newUsers = { ...prev };
                    delete newUsers[user.id];
                    return newUsers;
                });
            });
    }, []);

    const handleConversationClick = (conversation) => {
        try {
            console.log('Conversación seleccionada:', conversation);
            
            if (!conversation || !conversation.id) {
                console.error('Conversación inválida:', conversation);
                return;
            }
            
            // Actualizar el estado
            setActiveConversation(conversation);
            setSidebarOpen(false);
            
            // En caso de que haya problemas con el evento click, forzar la navegación
            const url = conversation.is_user 
                ? route('chat.user', { user: conversation.id }) 
                : route('chat.group', { group: conversation.id });
                
            // Solo forzar navegación si hay problemas
            if (window.location.href.includes('/user/') || window.location.href.includes('/group/')) {
                if (window.location.href !== url) {
                    window.location.href = url;
                }
            }
        } catch (error) {
            console.error('Error al manejar clic de conversación:', error);
        }
    };

    return (
        <div className="flex-1 w-full flex overflow-hidden">
            <div className={`sidebar w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden p-2 ${sidebarOpen ? 'block' : 'hidden'} sm:block`}>
                <div className="flex items-center justify-between py-4 px-7 text-xl font-medium">
                    My Conversations
                    <div className="tooltip tooltip-left" data-tip="Create New Group">
                        <button className="text-gray-400 hover:text-gray-200">
                            <PencilSquareIcon className="w-5 h-5 inline-block ml-2" />
                        </button>
                    </div>
                </div>
                <div className="p-3">
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder="Filter users and groups"
                        className="w-full"
                    />
                </div>
                <div className="flex-1 overflow-y-auto h-full">
                    {sortedConversations && sortedConversations.map((conversation) => (
                        <div key={`${conversation.is_group ? "group" : "user"}-${conversation.id}`} className="py-2">
                            <ConversationItem
                                conversation={conversation}
                                selectedConversation={selectedConversation}
                                onSelect={handleConversationClick}
                                online={isUserOnline(conversation.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="content flex-1 flex flex-col overflow-hidden p-2 transition-transform transform duration-300 ease-in-out">
                {!sidebarOpen && (
                    <button
                        className="sm:hidden p-2 text-gray-400 hover:text-gray-200"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                {selectedConversation || activeConversation ? (
                    <div className="flex flex-col h-full">
                        {React.cloneElement(children, { selectedConversation: selectedConversation || activeConversation })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Selecciona una conversación</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;