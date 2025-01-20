import { Menu, Transition } from '@headlessui/react';
import { MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon,
         LockOpenIcon,
         LockClosedIcon,
         UserIcon,
        } from '@heroicons/react/24/solid';
import axios from 'axios';
import { ShieldCheckIcon } from '@heroicons/react/20/solid';

export default function UserOptionsDropdown({ conversation }) {
    const changeUserRole = () => {
        console.log("Change User Role");
        if (!conversation.is_user) {
            return;
        }

        //send axios post request to change user role and show notification on success
        axios
            .post(route("users.changeRole", conversation.id))
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const onBlockUser = () => {
        console.log("Block User");
        if (!conversation.is_user) {
            return;
        }

        //send axios post request to block user and show notification on success
        axios
            .post(route("users.blockUnblock", conversation.id))
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div>
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <MenuButton className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/40">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </MenuButton>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50">
                        <div className="py-1 fixed overflow-visible bg-gray-800">
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${focus ? "bg-black/30 text-white" : "text-gray-100"
                                            } group flex items-center px-4 py-2 text-sm`}
                                    >
                                        {conversation.blocked_at && (
                                            <>
                                                <LockOpenIcon className="w-4 h-4 mr-2" />
                                                Desbloquear
                                            </>
                                        )}
                                        {(
                                            <>
                                                <LockOpenIcon className="w-4 h-4 mr-2" />
                                                Bloquear
                                            </>
                                        )}
                                    </button>
                                )}
                            </MenuItem>
                        </div>
                        <div className="px-1  bg-gray-800">
                            <MenuItem>
                                {({ focus }) => (
                                    <button
                                        onClick={changeUserRole}
                                        className={`${focus
                                                ? "bg-black/30 text-white"
                                                : "text-gray-100"
                                            } group flex items-center px-4 py-2 text-sm`}
                                    >
                                        {conversation.is_admin && (
                                            <>
                                                <UserIcon className="w-4 h-4 mr-2" />
                                                Usuario Común
                                            </>
                                        )}
                                        {conversation.is_admin && (
                                            <>
                                                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                                Administrador
                                            </>
                                        )}
                                    </button>
                                )}
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    )
}