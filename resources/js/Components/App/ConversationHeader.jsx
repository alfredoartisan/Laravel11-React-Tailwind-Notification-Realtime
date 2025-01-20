import { Link, usePage } from "@inertiajs/inertia-react";
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";

const ConversationHeader = ({ selectedConversation }) => {
   
   
   return ( <>
        {selectedConversation && (
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <Link
                        href={route("dashboard")}
                        className="inline-block sm:hidden"
                    >
                        <ArrowLeftIcon className="w-6" />
                    </Link>
                    {selectedConversation.is_user && (
                    <UserAvatar user={selectedConversation} />
                    )}
                    {selectedConversation.is_group && <GroupAvatar />}
                    <div>
                        <h3>{selectedConversation.name}</h3>
                        <p className="text-xs text-gray-500">
                        {selectedConversation.users.lenght} 
                        </p>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default ConversationHeader;