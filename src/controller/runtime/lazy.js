let rrwebPromise = null;
export function ensureRrweb(){
  if(!rrwebPromise){
    rrwebPromise = import('rrweb').catch(()=>({}));
  }
  return rrwebPromise;
}
