import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
    withCredentials: true,
    autoConnect: false
});

export const connectSocket = () => {
    const guest = JSON.parse(localStorage.getItem("guest"));

    if (guest) socket.auth = { guestId: guest.id, guestName: guest.name };
    if(!socket.connected) socket.connect();
};