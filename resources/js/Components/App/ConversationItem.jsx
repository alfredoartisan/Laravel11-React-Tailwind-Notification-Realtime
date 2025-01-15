import { Link, usePage } from '@inertiajs/inertia-react';
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import UserOptionsDropdown from "./UserOptionsDropdown";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    onSelect = null,
}) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = "border-trasparent";
    if (selectedConversation
        !selectedConversation.is_group &&
            !conversation.is_group &&
            selectedConversation.id === conversation.id
    ) {
    classes = "border-blue-500 bg-black/20";
}
if (
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
            "conversation-item flex items-center gap-2 text-gray-300 transition-all cursor-pointer border-1-4 hover:bg-black/30" +
            classes +
            (conversation.is_user && currentUser.is_admin
                ? "pr-2"
                : "pr-4")
        }

    >
        {conversation.is_user &&<UserAvatar/>}
        <div
            className={`flex-1 text`}            ></div>
    </Link>
);
};

export default ConversationItem;