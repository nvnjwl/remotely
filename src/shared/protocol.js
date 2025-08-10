// Message protocol definitions (ES module)
// Chrome 100 target so we can use modern syntax (optional chaining, etc.)

export const MessageTypes = Object.freeze({
  LOG: 'LOG',
  NET_REQ: 'NET_REQ',
  NET_RES: 'NET_RES',
  RRWEB_EVENT: 'RRWEB_EVENT',
  CMD: 'CMD',
  CMD_RESULT: 'CMD_RESULT',
  STATUS: 'STATUS',
  STORAGE: 'STORAGE',
  HANDSHAKE: 'HANDSHAKE',
  PING: 'PING',
  PONG: 'PONG'
});

export function createMessage(type, payload = {}, meta = {}) {
  return { v: 1, type, payload, meta, ts: Date.now() };
}
