import Peer from 'peerjs';
import { Transport } from '../shared/transport.js';
import { MessageTypes } from '../shared/protocol.js';
import { handleIncoming } from './commandExec.js';
import { snapshotStorage } from './storageWatcher.js';

let transport = null;
let secret = null;

export function initSdkTransport(selfId, controllerId, options={}){
  secret = options.secret || null;
  transport = new Transport(id => new Peer(id, options.peer || {}), {
    onMessage: onMessage,
    debug: options.debug
  });
  transport.init(selfId);
  transport.onOpen(()=>{
    // if we initiated, handshake already sent in sendHandshake call triggered after open
  });
  transport.peer.on('open', ()=>{
    if(controllerId){
      transport.connect(controllerId);
      setTimeout(()=>sendHandshake(), 300);
    }
  });
}

function onMessage(msg){
  if(msg.type === MessageTypes.HANDSHAKE){
    if(secret && msg.payload?.secret !== secret) return; // ignore invalid
    // store controller id if not present
    if(!localStorage.getItem('controllerId') && msg.meta?.from){
      localStorage.setItem('controllerId', msg.meta.from);
    }
    return; // ack only
  }
  handleIncoming(msg);
}

export function getSdkTransport(){ return transport; }

function sendHandshake(){
  transport?.send(MessageTypes.HANDSHAKE, { secret });
  snapshotStorage();
}
