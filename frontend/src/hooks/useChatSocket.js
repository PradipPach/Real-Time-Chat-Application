import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "../api/axios";

/**
 * Opens the WebSocket, reconnects automatically if it drops,
 * and gives you a `send` function.
 */
export default function useChatSocket(token, onEvent) {
  const wsRef = useRef(null);
  const handlerRef = useRef(onEvent);
  const [connected, setConnected] = useState(false);

  // always call the latest handler (so it sees fresh state)
  useEffect(() => {
    handlerRef.current = onEvent;
  });

  useEffect(() => {
    if (!token) return;
    let closedByUs = false;
    let retryTimer;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (e) => {
        try {
          handlerRef.current(JSON.parse(e.data));
        } catch (err) {
          console.error("Bad socket message", err);
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closedByUs) retryTimer = setTimeout(connect, 2000); // try again in 2s
      };
    };

    connect();
    return () => {
      closedByUs = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, [token]);

  const send = useCallback((payload) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  return { send, connected };
}
