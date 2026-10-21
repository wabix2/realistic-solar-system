// Pairwise Newtonian gravity for N bodies (uses Newton's 3rd law, O(N^2/2)).
import {G,N,M} from "./bodies.js";
function acc(x,a){a.fill(0);for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dx=x[3*j]-x[3*i],dy=x[3*j+1]-x[3*i+1],dz=x[3*j+2]-x[3*i+2],r2=dx*dx+dy*dy+dz*dz,f=G/(r2*Math.sqrt(r2)),fi=f*M[j],fj=f*M[i];
a[3*i]+=fi*dx;a[3*i+1]+=fi*dy;a[3*i+2]+=fi*dz;a[3*j]-=fj*dx;a[3*j+1]-=fj*dy;a[3*j+2]-=fj*dz}}

export {acc};
