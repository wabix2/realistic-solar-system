// Generates the data for the paper's figures: error vs time step, cost, and long-run energy drift.
// Usage: node scripts/convergence.js   -> results/convergence.csv, results/energy_drift.csv
import {writeFileSync} from "node:fs";
import {Sim} from "../src/integrators.js";
const run=(m,dt,yrs)=>{const s=new Sim(m),t0=performance.now();for(let k=0,n=Math.round(yrs/dt);k<n;k++)s.step(dt);return[s,performance.now()-t0]};
const ref=run("rk45",.01,10)[0];                       // reference solution (energy error ~1e-12)
let c="method,dt_days,rel_energy_error,rel_angmom_error,earth_position_error_AU,runtime_ms\n";
for(const m of["euler","verlet","rk4"])for(const dt of[.04,.02,.01,.005,.0025,.00125]){
  const[s,ms]=run(m,dt,10);c+=[m,(dt*365.25).toFixed(3),Math.abs((s.energy()-s.E0)/s.E0).toExponential(3),Math.abs(s.ang()/s.L0-1).toExponential(3),
    Math.hypot(s.x[9]-ref.x[9],s.x[10]-ref.x[10],s.x[11]-ref.x[11]).toExponential(3),ms.toFixed(1)].join(",")+"\n"}
writeFileSync("results/convergence.csv",c);
let d="year,euler,verlet,rk4,rk45\n";const S=["euler","verlet","rk4","rk45"].map(m=>new Sim(m)),dt=.005;
for(let y=1;y<=100;y++){S.forEach(s=>{for(let k=0;k<Math.round(1/dt);k++)s.step(dt)});d+=y+","+S.map(s=>Math.abs((s.energy()-s.E0)/s.E0).toExponential(3)).join(",")+"\n"}
writeFileSync("results/energy_drift.csv",d);console.log(c);
