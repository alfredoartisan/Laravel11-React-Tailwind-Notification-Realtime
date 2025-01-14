import { usePage } from "@inertiajs/react";
import React, { useEffect } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);

    useEffect(() => {
        window.Echo.join('online')
            .here((users) => {
                console.log("here", users);
            })
            .joining((user) => {
                console.log("joining", user);
            })
            .leaving((user) => {
                console.log("leaving", user);
            })
            .error(error => {
                console.error(error);
            });
    }, []);

    return (
        <>
            ChatLayout
            <div>
                {children}
            </div>
        </>
    );
};

export default ChatLayout;