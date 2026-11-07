# Bundles app/public into one Worker module and deploys it to <name>.<subdomain>.workers.dev
import json,os,subprocess,sys
ACC="c2f76198bfeda4b426625f2564d6bd48"; NAME="gradient-ai"
P="app/public"
files={}
for f in ["index.html","app.js","styles.css","data.json","og.png","favicon.svg"]:
  fp=os.path.join(P,f)
  if os.path.exists(fp): files["/"+f]=open(fp,"rb").read()
import base64
CT={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".svg":"image/svg+xml"}
entries={k:{"b64":base64.b64encode(v).decode(),"ct":CT[os.path.splitext(k)[1]]} for k,v in files.items()}
js="const F="+json.dumps(entries)+""";
const bin=(s)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const C={};for(const k in F)C[k]=bin(F[k].b64);
export default{async fetch(req){const u=new URL(req.url);let p=u.pathname;if(p==="/"||!F[p])p=F[p]?p:"/index.html";
const h={"content-type":F[p].ct,"x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin",
"cache-control":p==="/data.json"?"public, max-age=900":p==="/index.html"?"public, max-age=300":"public, max-age=3600"};
return new Response(C[p],{headers:h});}};"""
open("worker.mjs","w").write(js)
meta=json.dumps({"main_module":"worker.mjs","compatibility_date":"2026-10-01"})
open("meta.json","w").write(meta)
r=subprocess.run(["curl","-s","-X","PUT",f"https://api.cloudflare.com/client/v4/accounts/{ACC}/workers/scripts/{NAME}",
  "-F",f"metadata=@meta.json;type=application/json","-F","worker.mjs=@worker.mjs;type=application/javascript+module"],capture_output=True,text=True)
d=json.loads(r.stdout); print("upload",d["success"],d.get("errors"))
r=subprocess.run(["curl","-s","-X","POST",f"https://api.cloudflare.com/client/v4/accounts/{ACC}/workers/scripts/{NAME}/subdomain","-H","content-type: application/json","-d",'{"enabled":true,"previews_enabled":false}'],capture_output=True,text=True)
print("subdomain",r.stdout[:200])
r=subprocess.run(["curl","-s",f"https://api.cloudflare.com/client/v4/accounts/{ACC}/workers/subdomain"],capture_output=True,text=True)
print(f"https://{NAME}.{json.loads(r.stdout)['result']['subdomain']}.workers.dev")
