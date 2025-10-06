import React, { createContext, useState, useContext } from 'react';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [activeConversation, setActiveConversation] = useState(null);
    
    return (
        <ConversationContext.Provider value={{ activeConversation, setActiveConversation }}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => useContext(ConversationContext);