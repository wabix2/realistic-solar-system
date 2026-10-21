"""Make paper figures from results/*.csv.  Usage: python3 scripts/plot.py  (needs matplotlib)"""
import csv, collections, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
C=collections.defaultdict(list)
for r in csv.DictReader(open("results/convergence.csv")): C[r["method"]].append((float(r["dt_days"]),float(r["earth_position_error_AU"]),float(r["rel_energy_error"])))
col={"euler":"#d33","verlet":"#2a2","rk4":"#08c","rk45":"#e90"}
fig,ax=plt.subplots(1,2,figsize=(10,4))
for m,v in C.items():
    ax[0].loglog([a for a,_,_ in v],[b for _,b,_ in v],"o-",c=col[m],label=m)
    ax[1].loglog([a for a,_,_ in v],[max(c,1e-16) for _,_,c in v],"o-",c=col[m],label=m)
ax[0].set(xlabel="time step (days)",ylabel="Earth position error after 10 yr (AU)",title="Convergence"); ax[1].set(xlabel="time step (days)",ylabel="relative energy error",title="Energy error after 10 yr")
for a in ax: a.grid(alpha=.3,which="both"); a.legend()
plt.tight_layout(); plt.savefig("docs/figures/convergence.png",dpi=150)
D=list(csv.DictReader(open("results/energy_drift.csv"))); plt.figure(figsize=(6,4))
for m in["euler","verlet","rk4","rk45"]: plt.semilogy([float(r["year"]) for r in D],[max(float(r[m]),1e-16) for r in D],c=col[m],label=m)
plt.xlabel("years"); plt.ylabel("|dE/E0|"); plt.title("Energy drift, dt = 1.83 days"); plt.grid(alpha=.3); plt.legend(); plt.tight_layout(); plt.savefig("docs/figures/energy_drift.png",dpi=150)
