// Relative motion only: never use a cursor's absolute window coordinates for Dalgu look.
export function mouseDelta(state,event){
 state.last=null;
 if(state.paused||!event.locked)return null;
 return [Number.isFinite(event.movementX)?event.movementX:0,Number.isFinite(event.movementY)?event.movementY:0];
}
