import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
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

    // Al cargar el componente, restaurar la conversación seleccionada
    useEffect(() => {
        const savedConversationId = localStorage.getItem('selectedConversationId');
        const savedConversationType = localStorage.getItem('selectedConversationType');

        if (savedConversationId && savedConversationType) {
            // Encontrar la conversación guardada
            const savedConversation = conversations.find(c =>
                c.id.toString() === savedConversationId &&
                c.type === savedConversationType
            );

            if (savedConversation) {
                setActiveConversation(savedConversation);

                // Navegar a la URL correcta
                if (savedConversationType === 'user') {
                    router.visit(`/user/${savedConversationId}`, {
                        preserveState: true,
                        replace: true
                    });
                } else if (savedConversationType === 'group') {
                    router.visit(`/group/${savedConversationId}`, {
                        preserveState: true,
                        replace: true
                    });
                }
            }
        }
    }, []);

    // Cuando la conversación activa cambia, guardarla
    useEffect(() => {
        if (activeConversation?.id) {
            localStorage.setItem('selectedConversationId', activeConversation.id);
            localStorage.setItem('selectedConversationType', activeConversation.type);
        }
    }, [activeConversation]);

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

    // Modificar el useEffect que maneja el ordenamiento
    useEffect(() => {
        // Obtener el ID de la conversación activa (de cualquier fuente disponible)
        const currentActiveId = activeConversation?.id || 
                                selectedConversation?.id || 
                                localStorage.getItem('selectedConversationId');

        // Crear una nueva copia ordenada de las conversaciones
        const sortedConvs = [...localConversations].sort((a, b) => {
            // Prioridad 1: La conversación activa siempre va primero
            if (a.id === currentActiveId) return -1;
            if (b.id === currentActiveId) return 1;

            // Prioridad 2: Ordenar por último mensaje (mantener la lógica existente)
            if (a.last_message_date && b.last_message_date) {
                return b.last_message_date.localeCompare(a.last_message_date);
            } else if (a.last_message_date) {
                return -1;
            } else if (b.last_message_date) {
                return 1;
            }
            
            // Prioridad 3: Bloqueos (mantener la lógica existente)
            if (a.blocked_at && b.blocked_at) {
                return a.blocked_at > b.blocked_at ? 1 : -1;
            } else if (a.blocked_at) {
                return 1;
            } else if (b.blocked_at) {
                return -1;
            }
            
            return 0;
        });
        
        // Actualizar el estado solo si ha cambiado
        if (JSON.stringify(sortedConvs) !== JSON.stringify(sortedConversations)) {
            setSortedConversations(sortedConvs);
        }
    }, [localConversations, activeConversation, selectedConversation]);

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
            if (!conversation || !conversation.id) {
                console.error('Conversación inválida:', conversation);
                return;
            }

            // Actualizar el estado inmediatamente
            setActiveConversation(conversation);
            
            // Cerrar sidebar en móvil
            setSidebarOpen(false);
            
            // Guardar en localStorage
            localStorage.setItem('selectedConversationId', conversation.id);
            localStorage.setItem('selectedConversationType', conversation.is_group ? 'group' : 'user');
            
            // Construir URL correcta
            const url = conversation.is_group 
                ? `/group/${conversation.id}` 
                : `/user/${conversation.id}`;
                
            // Visitar la URL sin recargar
            router.visit(url, { 
                preserveState: true,
                // No usar replace para que la navegación funcione
            });
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