import {useState} from "react";


const webSocket = new WebSocket('http://localhost:3030/ws');

export function useSocket() {
  const [socket, setSocket] = useState(webSocket);

  return socket;
}