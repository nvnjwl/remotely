import { createMessage } from '../shared/protocol.js';
import { getSdkTransport } from './transport.js';

export function send(type, payload){
  const t = getSdkTransport();
  t?.send(type, payload, { from: t?.peer?.id });
}
