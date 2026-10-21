// In-page self-tests (the "Run self-tests" button). The full suite is in tests/.
import {G} from "./bodies.js";
import {Sim} from "./integrators.js";
function kepErr(h){let s=[1,0,0,2*Math.PI];const f=q=>{const r3=Math.hypot(q[0],q[1])**3;return[q[2],q[3],-G*q[0]/r3,-G*q[1]/r3]},ad=(q,k,c)=>q.map((u,i)=>u+c*k[i]);
for(let n=Math.round(1/h);n--;){const k1=f(s),k2=f(ad(s,k1,h/2)),k3=f(ad(s,k2,h/2)),k4=f(ad(s,k3,h));s=s.map((u,i)=>u+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]))}return Math.hypot(s[0]-1,s[1])}
function runSelfTests(){const out=[],ok=(n,b,d)=>out.push((b?"PASS ":"FAIL ")+n+" ("+d+")");
const r=kepErr(.01)/kepErr(.005);ok("RK4 4th-order convergence (halve dt -> error /16)",r>12&&r<20,"ratio "+r.toFixed(1));
const s=new Sim("rk4");let th0=Math.atan2(s.x[11]-s.x[2],s.x[9]-s.x[0]),prev=th0,tot=0,P=0;for(let k=0;k<700&&!P;k++){s.step(.002);const th=Math.atan2(s.x[11]-s.x[2],s.x[9]-s.x[0]);let d=th-prev;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;tot+=d;prev=th;if(Math.abs(tot)>=2*Math.PI)P=s.t}
ok("Earth period ~ 1 year",Math.abs(P-1)<.004,"P = "+P.toFixed(4)+" yr");
const v=new Sim("verlet");for(let k=0;k<2000;k++)v.step(.005);const de=Math.abs((v.energy()-v.E0)/v.E0);ok("Verlet energy error < 1e-4 over 10 yr",de<1e-4,de.toExponential(1));
const e=new Sim("euler");for(let k=0;k<2000;k++)e.step(.005);const ee=Math.abs((e.energy()-e.E0)/e.E0);ok("Euler drifts far more than Verlet",ee>100*de,ee.toExponential(1));
return out}

export {runSelfTests};
