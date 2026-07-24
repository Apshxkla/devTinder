import { useEffect } from "react";
import { getSocket } from "../services/socket";

// Subscribe to a socket event for the lifetime of the component
export const useSocketEvent = (event, handler, deps = []) => {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => socket.off(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
