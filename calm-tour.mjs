// A presentation-only trajectory: calibrated source poses are never modified.
export function sampleTour(samples,time){
 time=Math.max(0,Math.min(time,samples.at(-1).t));let lo=0,hi=samples.length-1;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(samples[mid].t<=time)lo=mid;else hi=mid;}
 const a=samples[lo],b=samples[hi],u=(time-a.t)/(b.t-a.t);
 return {a,b,u,index:a.i+(b.i-a.i)*u};
}
export function timeAtFrame(samples,index){
 index=Math.max(0,Math.min(index,samples.at(-1).i));let lo=0,hi=samples.length-1;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(samples[mid].i<=index)lo=mid;else hi=mid;}
 const a=samples[lo],b=samples[hi];return a.t+(b.t-a.t)*(index-a.i)/(b.i-a.i);
}
export function easeInOut(x){x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);}
