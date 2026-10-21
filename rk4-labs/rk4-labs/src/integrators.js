// Euler, Velocity Verlet, RK4 and adaptive Dormand-Prince RK45 for the N-body system.
import {G,N,M,DATA,arr} from "./bodies.js";
import {acc} from "./gravity.js";
import {kepler} from "./kepler.js";
const DP={c:[0,.2,.3,.8,8/9,1,1],a:[[],[.2],[3/40,9/40],[44/45,-56/15,32/9],[19372/6561,-25360/2187,64448/6561,-212/729],[9017/3168,-355/33,46732/5247,49/176,-5103/18656],[35/384,0,500/1113,125/192,-2187/6784,11/84]],
b4:[5179/57600,0,7571/16695,393/640,-92097/339200,187/2100,1/40],b5:[35/384,0,500/1113,125/192,-2187/6784,11/84,0]};
class Sim{constructor(m){this.method=m;this.t=0;this.h=0;this.x=arr();this.v=arr();this.a=arr();
this.T=["a1","a2","a3","a4","x2","x3","x4","v2","v3","v4"].reduce((o,k)=>(o[k]=arr(),o),{});
let P=[0,0,0],R=[0,0,0];DATA.forEach((d,i)=>{if(!i)return;const[p,v]=kepler(d);for(let k=0;k<3;k++){this.x[3*i+k]=p[k];this.v[3*i+k]=v[k];P[k]+=M[i]*v[k];R[k]+=M[i]*p[k]}});
{const T=M.reduce((q,m)=>q+m,0);for(let i=0;i<N;i++)for(let k=0;k<3;k++){this.x[3*i+k]-=R[k]/T;this.v[3*i+k]-=P[k]/T}}   // heliocentric elements, then shift so the barycentre is at rest at the origin
acc(this.x,this.a);this.E0=this.energy();this.L0=this.ang()}
energy(){let e=0;for(let i=0;i<N;i++){e+=.5*M[i]*(this.v[3*i]**2+this.v[3*i+1]**2+this.v[3*i+2]**2);for(let j=i+1;j<N;j++)e-=G*M[i]*M[j]/Math.hypot(this.x[3*i]-this.x[3*j],this.x[3*i+1]-this.x[3*j+1],this.x[3*i+2]-this.x[3*j+2])}return e}
ang(){let a=0,b=0,c=0;for(let i=0;i<N;i++){const x=this.x,v=this.v,m=M[i];a+=m*(x[3*i+1]*v[3*i+2]-x[3*i+2]*v[3*i+1]);b+=m*(x[3*i+2]*v[3*i]-x[3*i]*v[3*i+2]);c+=m*(x[3*i]*v[3*i+1]-x[3*i+1]*v[3*i])}return Math.hypot(a,b,c)}
step(dt){const{x,v,a,T}=this,n=3*N;
if(this.method=="euler"){acc(x,a);for(let k=0;k<n;k++){x[k]+=v[k]*dt;v[k]+=a[k]*dt}}
else if(this.method=="verlet"){for(let k=0;k<n;k++)x[k]+=v[k]*dt+.5*a[k]*dt*dt;acc(x,T.a1);for(let k=0;k<n;k++){v[k]+=.5*(a[k]+T.a1[k])*dt;a[k]=T.a1[k]}}
else if(this.method=="rk4"){const h=dt/2;acc(x,T.a1);for(let k=0;k<n;k++){T.x2[k]=x[k]+h*v[k];T.v2[k]=v[k]+h*T.a1[k]}acc(T.x2,T.a2);
for(let k=0;k<n;k++){T.x3[k]=x[k]+h*T.v2[k];T.v3[k]=v[k]+h*T.a2[k]}acc(T.x3,T.a3);for(let k=0;k<n;k++){T.x4[k]=x[k]+dt*T.v3[k];T.v4[k]=v[k]+dt*T.a3[k]}acc(T.x4,T.a4);
for(let k=0;k<n;k++){x[k]+=dt/6*(v[k]+2*T.v2[k]+2*T.v3[k]+T.v4[k]);v[k]+=dt/6*(T.a1[k]+2*T.a2[k]+2*T.a3[k]+T.a4[k])}}
else{this.rk45(dt);return}this.t+=dt}
rk45(dt){const n=3*N,tEnd=this.t+dt,K=[],y=arr(6*n/3),yt=arr(6*n/3),xs=yt.subarray(0,n),f=(Y,out)=>{out.set(Y.subarray(n),0);acc(Y.subarray(0,n),out.subarray(n))};
for(let s=0;s<7;s++)K.push(arr(2*n));if(!this.h)this.h=dt;y.set(this.x,0);y.set(this.v,n);
while(this.t<tEnd-1e-14){const h=Math.min(this.h,tEnd-this.t);f(y,K[0]);
for(let s=1;s<7;s++){for(let k=0;k<2*n;k++){let q=0;for(let j=0;j<s;j++)q+=DP.a[s][j]*K[j][k];yt[k]=y[k]+h*q}f(yt,K[s])}
let err=0;for(let k=0;k<2*n;k++){let e5=0,e4=0;for(let s=0;s<7;s++){e5+=DP.b5[s]*K[s][k];e4+=DP.b4[s]*K[s][k]}err=Math.max(err,Math.abs(h*(e5-e4))/(1e-13+1e-11*Math.abs(y[k])))}
if(err<=1){for(let k=0;k<2*n;k++){let q=0;for(let s=0;s<6;s++)q+=DP.b5[s]*K[s][k];y[k]+=h*q}this.t+=h}
this.h=Math.min(dt,h*Math.min(5,Math.max(.2,.9*Math.pow(err||1e-10,-.2))))}
this.x.set(y.subarray(0,n));this.v.set(y.subarray(n))}}

export {DP,Sim};
