import { Link, usePage } from "@inertiajs/inertia-react";
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";

const ConversationHeader = ({ selectedConversation, onBack }) => {
    return (
        <>
            {selectedConversation && (
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <button
                            className="inline-block sm:hidden"
                            onClick={onBack}
                        >
                            <ArrowLeftIcon className="w-6" />
                        </button>
                        {selectedConversation.is_user && (
                            <UserAvatar user={selectedConversation} />
                        )}
                        {selectedConversation.is_group && <GroupAvatar />}
                        <div>
                            <h3>{selectedConversation.name}</h3>
                            <p className="text-xs text-gray-500">
                                {selectedConversation.users.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConversationHeader;