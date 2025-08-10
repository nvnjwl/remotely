// PeerJS transport wrapper (placeholder) - to be implemented
import { createMessage } from './protocol.js';

export class Transport {
  constructor(peerFactory, { onMessage, debug } = {}) {
    this.peerFactory = peerFactory; // function returning Peer instance
    this.onMessage = onMessage;
    this.debug = !!debug;
    this.peer = null;
    this.conn = null;
  }

  log(...args) { if (this.debug) console.debug('[transport]', ...args); }

  async init(id) {
    this.peer = this.peerFactory(id);
    this.peer.on('open', () => this.log('peer open', id));
    this.peer.on('error', err => this.log('peer error', err));
    this.peer.on('connection', conn => {
      this.log('incoming connection', conn.peer);
      this._attachConn(conn, true);
    });
  }

  connect(targetId) {
    if (!this.peer) throw new Error('peer not initialized');
    const conn = this.peer.connect(targetId, { reliable: true });
    this._attachConn(conn, false);
  }

  _attachConn(conn, incoming){
    this.conn = conn;
    conn.on('open', () => {
      this.log('conn open', conn.peer, incoming? '(incoming)': '(outgoing)');
      if(this._onOpen) this._onOpen();
    });
    conn.on('data', data => { if (this.onMessage) this.onMessage(data); });
    conn.on('error', e => this.log('conn error', e));
    conn.on('close', () => this.log('conn closed'));
  }

  onOpen(fn){ this._onOpen = fn; }

  send(type, payload, meta) {
    if (this.conn?.open) {
      const full = createMessage(type, payload, meta);
      this.conn.send(full);
    }
  }
}
