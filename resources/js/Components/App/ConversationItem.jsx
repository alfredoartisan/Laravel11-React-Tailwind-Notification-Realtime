import React from 'react';
import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import UserOptionsDropdown from "./UserOptionsDropdown";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    onSelect = null,
    online = false,
}) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = "border-transparent";
    if (
        selectedConversation &&
        !selectedConversation.is_group &&
        !conversation.is_group &&
        selectedConversation.id === conversation.id
    ) {
        classes = "border-blue-500 bg-black/20";
    }
    if (
        selectedConversation &&
        selectedConversation.is_group &&
        conversation.is_group &&
        selectedConversation.id === conversation.id
    ) {
        classes = "border-blue-500 bg-black/20";
    }

    return (
        <Link
            href={
                conversation.is_group
                    ? route("chat.group", conversation)
                    : route("chat.user", conversation)
            }
            preserveState
            className={
                "conversation-item flex items-center gap-2 text-gray-300 transition-all cursor-pointer border-1-4 hover:bg-black/30 " +
                classes +
                (conversation.is_user && currentUser.is_admin
                    ? " pr-2"
                    : " pr-4")
            }
            onClick={() => onSelect && onSelect(conversation)}
        >
            {conversation.is_user && (
                <UserAvatar user={conversation} online={online} />
            )}
            {conversation.is_group && <GroupAvatar />}
            <div
                className={
                    "flex-1 text-xs max-w-full overflow-hidden" +
                    (conversation.is_user && conversation.blocked_at
                        ? " opacity-50"
                        : "")
                }
            >
                <div className="flex justify-between items-center">
                    <span className="truncate">{conversation.name}</span>
                    <span className="text-gray-400 text-xs ml-2">
                        {new Date(conversation.last_message_date).toLocaleString()}
                    </span>
                    {conversation.is_user && currentUser.is_admin && (
                        <UserOptionsDropdown conversation={conversation} />
                    )}
                </div>
                <div className="text-gray-500 truncate">
                    {conversation.last_message}
                </div>
            </div>
        </Link>
    );
};

export default ConversationItem;