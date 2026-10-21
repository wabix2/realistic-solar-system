// Convert orbital elements -> position/velocity (solves Kepler's equation by Newton iteration).
import {G,D} from "./bodies.js";
function kepler(d){const[,,a,e,I,L,vp,Om]=d,w=(vp-Om)*D,i=I*D,O=Om*D;let m=((L-vp)*D)%(2*Math.PI),E=m;for(let k=0;k<12;k++)E-=(E-e*Math.sin(E)-m)/(1-e*Math.cos(E));
const r=a*(1-e*Math.cos(E)),xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E),q=Math.sqrt(G*a)/r,up=-q*Math.sin(E),vq=q*Math.sqrt(1-e*e)*Math.cos(E);
const rot=(x,y)=>{const x1=x*Math.cos(w)-y*Math.sin(w),y1=x*Math.sin(w)+y*Math.cos(w),y2=y1*Math.cos(i),z=y1*Math.sin(i);return[x1*Math.cos(O)-y2*Math.sin(O),z,-(x1*Math.sin(O)+y2*Math.cos(O))]};
return[rot(xp,yp),rot(up,vq)]}   // ecliptic (X,Y,Z) mapped to three.js (X,Z,-Y)

export {kepler};
