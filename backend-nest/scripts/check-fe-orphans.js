// check-fe-orphans.js
const fs=require('fs');function csv(p){const t=fs.readFileSync(p,'utf-8').trim().split('\n');const h=t.shift().split(',');return t.map(l=>{const c=l.split(',');const o={};h.forEach((k,i)=>o[k.trim()]=(c[i]||'').trim());return o;});}
function norm(k){return k.replace(/\s+/g,' ').replace(/:([A-Za-z0-9_]+)/g,'{$1}').replace(/\/$/,'')}
const oa=new Set(csv('artifacts/openapi_contracts.csv').map(r=>norm((r.method||r.METHOD)+' '+(r.path||r.PATH))));
const be=new Set(csv('artifacts/route_inventory_backend.csv').map(r=>norm((r.method||r.method)+' '+(r.path||r.path))));
const ok=new Set([...oa].filter(k=>be.has(k)));
const fe=csv('artifacts/fe_calls_web.csv').map(r=>norm((r.method||'GET')+' '+(r.path||r.url||'')));
const orphans=fe.filter(k=>!ok.has(k));
let out='method,path\n';orphans.forEach(k=>{const i=k.indexOf(' ');out+=k.substring(0,i)+','+k.substring(i+1)+'\n';});
require('fs').mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/fe_orphans.csv',out);
if(orphans.length>0){process.exit(1);}