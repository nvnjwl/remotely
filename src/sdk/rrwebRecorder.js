import { send } from './send.js';
import { MessageTypes } from '../shared/protocol.js';

let started = false;
export async function startRrweb(){
  if(started) return; started = true;
  const rr = await import('rrweb');
  rr.record({
    emit(event){
      send(MessageTypes.RRWEB_EVENT, event);
    },
    sampling: { scroll: 200, mousemove: 100 } // throttle heavy events
  });
}
