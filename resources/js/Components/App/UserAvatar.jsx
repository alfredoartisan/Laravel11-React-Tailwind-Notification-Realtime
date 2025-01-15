import React from "react";

const UserAvatar = ({ user, online = null, profile = false }) => {
    const onlineClass = online ? "bg-green-500" : "bg-gray-400";
    const sizeClass = profile ? "w-40 h-40" : "w-8 h-8";

    return (
        <div className="relative">
            {user.avatar_url ? (
                <div className={`chat-image avatar ${sizeClass}`}>
                    <img src={user.avatar_url} alt={user.name} className="rounded-full" />
                </div>
            ) : (
                <div className={`chat-image avatar placeholder ${sizeClass}`}>
                    <div className="bg-gray-400 text-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-xl">
                            {user.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
            <span className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ${onlineClass} border-2 border-white`}></span>
        </div>
    );
};

export default UserAvatar;