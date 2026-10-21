import test from "node:test";
import assert from "node:assert/strict";
import {G,N,M,DATA,arr} from "../src/bodies.js";
import {acc} from "../src/gravity.js";
import {Sim} from "../src/integrators.js";
import {TP} from "../src/testparticles.js";

const run=(method,dt,years)=>{const s=new Sim(method);for(let k=0,n=Math.round(years/dt);k<n;k++)s.step(dt);return s};
const dE=s=>Math.abs((s.energy()-s.E0)/s.E0);

test("Newton's 3rd law: total force is zero",()=>{
  const s=new Sim("rk4"),a=arr();acc(s.x,a);
  for(let k=0;k<3;k++){let f=0;for(let i=0;i<N;i++)f+=M[i]*a[3*i+k];assert.ok(Math.abs(f)<1e-12)}
});
test("barycentre starts at rest at the origin",()=>{
  const s=new Sim("rk4");
  for(let k=0;k<3;k++){let p=0,r=0;for(let i=0;i<N;i++){p+=M[i]*s.v[3*i+k];r+=M[i]*s.x[3*i+k]}assert.ok(Math.abs(p)<1e-12&&Math.abs(r)<1e-12)}
});
test("initial heliocentric semi-major axes match the JPL table (<1%)",()=>{
  const s=new Sim("rk4");
  for(let i=1;i<N;i++){const d=[0,1,2].map(k=>s.x[3*i+k]-s.x[k]),w=[0,1,2].map(k=>s.v[3*i+k]-s.v[k]);
    const r=Math.hypot(...d),v2=w.reduce((q,u)=>q+u*u,0),a=1/(2/r-v2/G);assert.ok(Math.abs(a/DATA[i][2]-1)<.01,DATA[i][0])}
});
test("RK4 is 4th order (halving dt shrinks error ~16x)",()=>{
  const ref=run("rk45",.01,1),err=dt=>{const s=run("rk4",dt,1);return Math.hypot(s.x[9]-ref.x[9],s.x[10]-ref.x[10],s.x[11]-ref.x[11])};
  const r=err(.02)/err(.01);assert.ok(r>10&&r<24,"ratio "+r);
});
test("Velocity Verlet: bounded energy error and angular momentum conserved",()=>{
  const s=run("verlet",.005,50);assert.ok(dE(s)<1e-4);assert.ok(Math.abs(s.ang()/s.L0-1)<1e-10);
});
test("Explicit Euler drifts >100x more than Verlet",()=>{assert.ok(dE(run("euler",.005,10))>100*dE(run("verlet",.005,10)))});
test("Adaptive RK45 reaches <1e-9 energy error over 10 years",()=>{assert.ok(dE(run("rk45",.01,10))<1e-9)});
test("test particle on a circular 1 AU orbit stays within 1% of its radius for 5 years",()=>{
  const s=new Sim("rk4"),p=new TP(1);p.p.set([s.x[0]+1,s.x[1],s.x[2]]);p.v.set([s.v[0],s.v[1],s.v[2]+Math.sqrt(G)]);   // circular orbit about the Sun's actual state
  let lo=9,hi=0;
  for(let k=0;k<1000;k++){s.step(.005);p.step(s,.005);const r=Math.hypot(p.p[0]-s.x[0],p.p[1]-s.x[1],p.p[2]-s.x[2]);lo=Math.min(lo,r);hi=Math.max(hi,r)}
  assert.ok(lo>.99&&hi<1.01,lo+" "+hi);
});
