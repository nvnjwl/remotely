// Minimal reactive store
const listeners = new Map();
const state = {
  connection: { status: 'disconnected', targetId: null, selfId: null },
  logs: [],
  network: [],
  storage: {},
  rrwebEvents: []
};

export function getState() { return state; }

export function setState(path, value) {
  const segments = path.split('.');
  let obj = state;
  for (let i = 0; i < segments.length - 1; i++) obj = obj[segments[i]];
  obj[segments[segments.length - 1]] = value;
  emit(path, value);
}

export function update(fn) { fn(state); emit('*', state); }

export function subscribe(path, cb) {
  if (!listeners.has(path)) listeners.set(path, new Set());
  listeners.get(path).add(cb);
  return () => listeners.get(path).delete(cb);
}

function emit(path, value) {
  if (listeners.has(path)) listeners.get(path).forEach(cb => cb(value));
  if (listeners.has('*')) listeners.get('*').forEach(cb => cb(state));
}
