import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data })
        } catch (error) {
            console.log(`Error in fetching users`);
            toast.error('Server Error')
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            console.log(`Error in fetching messages`);
            toast.error('Server Error')
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messagedata) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messagedata)
            set({ messages: [...messages, res.data] })
        } catch (error) {
            toast.error('Server Error')
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) {
            return;
        }

        const socket = useAuthStore.getState().socket

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId !== selectedUser._id;
            if (isMessageSentFromSelectedUser) {
                return;
            }
            set({ messages: [...get().messages, newMessage] })
        })
    },

    unsubscribeFromMessages: () => {

        const socket = useAuthStore.getState().socket
        socket.off('newMessage')
    },

    setSelectedUser: (selectedUser) => set({ selectedUser })
}))