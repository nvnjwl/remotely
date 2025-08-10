import Peer from 'peerjs';
import { Transport } from '../../shared/transport.js';
import { MessageTypes } from '../../shared/protocol.js';
import { update, setState, getState } from '../state/store.js';
import { handleCmdResult } from './commands.js';

let transport = null;
let secret = null;

export function initTransport(selfId, opts={}) {
  secret = opts.secret || null;
  transport = new Transport(id => new Peer(id, opts.peer || {}), {
    onMessage: handleMessage,
    debug: opts.debug
  });
  transport.init(selfId);
  transport.onOpen(() => {
    sendHandshake();
    setState('connection.status', 'connected');
  });
  setState('connection.status', 'ready');
  return transport;
}

export function connectTo(targetId){
  if(!transport) throw new Error('transport not ready');
  setState('connection.status', 'connecting');
  transport.connect(targetId);
  setTimeout(()=>{
    if(getState().connection.status !== 'connected') setState('connection.status', 'error');
  }, 10000);
}

export function getTransport(){ return transport; }

function handleMessage(msg){
  if(!msg || typeof msg !== 'object') return;
  if(msg.type === MessageTypes.HANDSHAKE) {
    if(secret && msg.payload?.secret !== secret) {
      // ignore invalid handshake
      return;
    }
    setState('connection.status', 'connected');
    return;
  }
  switch(msg.type){
    case MessageTypes.LOG:
      update(s=>{s.logs.push(msg.payload);});
      break;
    case MessageTypes.NET_REQ:
    case MessageTypes.NET_RES:
      update(s=>{s.network.push(msg.payload);});
      break;
    case MessageTypes.STORAGE:
      setState('storage', msg.payload);
      break;
    case MessageTypes.RRWEB_EVENT:
      update(s=>{ (s.rrwebEvents ||= []).push(msg.payload); });
      break;
    case MessageTypes.CMD_RESULT:
      handleCmdResult(msg);
      break;
  }
}

export function sendHandshake(){
  if(secret) transport?.send(MessageTypes.HANDSHAKE, { secret });
  else transport?.send(MessageTypes.HANDSHAKE, {});
}
