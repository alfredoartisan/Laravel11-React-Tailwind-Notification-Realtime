import { usePage } from "@inertiajs/react";
import Echo from "laravel-echo";
import { use } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);

    useEffect(() => {
        Echo.join('online')
            .here((users) => {
                console.log("users", users);
            })
            .joining((user) => {
                console.log("joining", user);
            })
            .leaving((user) => {
                console.log("leaving", user);
            })
            .listen('MessageSent', (e) => {
                console.log("MessageSent", e);
            })
            .error(error => {
                console.error(error);
            });
    }
    , []);
    return <>
        ChatLayout
        <div>
            {children}
        </div>
    </>
}

export default ChatLayout;