// Massless test particles (asteroid belt, comets) integrated with leapfrog.
import {G,M,arr} from "./bodies.js";
/* test particles (asteroid belt, comets): massless, kick-drift-kick leapfrog in the field of Sun+Jupiter+Saturn */
class TP{constructor(n){this.n=n;this.p=arr(3*n);this.v=arr(3*n);this.alive=1}
field(s,i,o){o[0]=o[1]=o[2]=0;for(const b of[0,5,6]){const dx=s.x[3*b]-this.p[3*i],dy=s.x[3*b+1]-this.p[3*i+1],dz=s.x[3*b+2]-this.p[3*i+2],r2=dx*dx+dy*dy+dz*dz+1e-6,f=G*M[b]/(r2*Math.sqrt(r2));o[0]+=f*dx;o[1]+=f*dy;o[2]+=f*dz}}
step(s,dt){const o=[0,0,0];for(let i=0;i<this.n;i++){this.field(s,i,o);for(let k=0;k<3;k++){this.v[3*i+k]+=o[k]*dt/2;this.p[3*i+k]+=this.v[3*i+k]*dt}this.field(s,i,o);for(let k=0;k<3;k++)this.v[3*i+k]+=o[k]*dt/2}}}

export {TP};
