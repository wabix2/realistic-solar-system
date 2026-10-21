// Solar-system data (JPL approximate Keplerian elements, J2000) and unit constants.
// Units: AU, years, solar masses -> G = 4*pi^2.

/* ================= PHYSICS (AU, years, solar masses; G = 4*pi^2) ================= */
const G=4*Math.PI**2,KMS=4.74047,D=Math.PI/180,MS=["euler","verlet","rk4","rk45"];
// JPL approximate Keplerian elements at J2000 (Standish): name, mass(Msun), a(AU), e, I, L, long.peri, long.node (deg), colour, display radius, type
const DATA=[["Sun",1,0,0,0,0,0,0,0xffcc00,60],
["Mercury",1.66e-7,.38709927,.20563593,7.00497902,252.2503235,77.45779628,48.33076593,0xaaaaaa,9,"r"],
["Venus",2.45e-6,.72333566,.00677672,3.39467605,181.9790995,131.60246718,76.67984255,0xe3bb76,14,"g"],
["Earth",3.003e-6,1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0,0x2288ff,15,"r"],
["Mars",3.23e-7,1.52371034,.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,0xff5533,11,"r"],
["Jupiter",9.55e-4,5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909,0xffa500,40,"g"],
["Saturn",2.86e-4,9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448,0xeeddaa,34,"g"],
["Uranus",4.37e-5,19.18916464,.04725744,.77263783,313.23810451,170.9542763,74.01692503,0x88ffff,24,"g"],
["Neptune",5.15e-5,30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,0x3366ff,24,"g"]];
const N=DATA.length,M=DATA.map(d=>d[1]),arr=n=>new Float64Array(n||3*N);

export {G,KMS,D,MS,DATA,N,M,arr};
