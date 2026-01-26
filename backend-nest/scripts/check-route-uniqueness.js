// check-route-uniqueness.js
const fs=require('fs');const path=process.argv[2]||'openapi/openapi.json';
const spec=JSON.parse(fs.readFileSync(path,'utf-8'));
function n(p){return ('/'+p).replace(/\/+/g,'/').replace(/:([A-Za-z0-9_]+)/g,'{$1}').replace(/\/$/,'')}
const seen=new Set(),dups=new Set();
for(const p in spec.paths||{}){const np=n(p);for(const m in spec.paths[p]){const k=(m.toUpperCase()+' '+np);if(seen.has(k))dups.add(k);else seen.add(k);}}
let out='method,path\n';[...dups].forEach(k=>{const i=k.indexOf(' ');out+=k.substring(0,i)+','+k.substring(i+1)+'\n';});
require('fs').mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/route_duplicates.csv',out);
if(dups.size>0){process.exit(1);}