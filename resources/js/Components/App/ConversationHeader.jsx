import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";

const ConversationHeader = ({ selectedConversation, onBack }) => {
    // Verificación adicional para evitar errores
    if (!selectedConversation) {
        return null;
    }
    
    // Extraer información sobre usuarios para grupos
    const usersCount = selectedConversation.is_group 
        ? (selectedConversation.users_count || (selectedConversation.users ? selectedConversation.users.length : 0))
        : null;
    
    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button
                        className="inline-block sm:hidden"
                        onClick={onBack}
                    >
                        <ArrowLeftIcon className="w-6" />
                    </button>
                )}
                {selectedConversation.is_user && (
                    <UserAvatar user={selectedConversation} />
                )}
                {selectedConversation.is_group && <GroupAvatar />}
                <div>
                    <h3>{selectedConversation.name || "Chat"}</h3>
                    <p className="text-xs text-gray-500">
                        {selectedConversation.is_group && usersCount 
                            ? `${usersCount} miembros` 
                            : selectedConversation.is_user ? 'Usuario' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConversationHeader;