import { getTransport } from './transportInstance.js';
import { MessageTypes } from '../../shared/protocol.js';

export function sendCommand(code, cb){
  const id = Math.random().toString(36).slice(2);
  pending.set(id, cb);
  getTransport()?.send(MessageTypes.CMD, { code, id });
}

const pending = new Map();
export function handleCmdResult(msg){
  const { id, success, value, error } = msg.payload;
  const fn = pending.get(id);
  if(fn){ fn({ success, value, error }); pending.delete(id); }
}
