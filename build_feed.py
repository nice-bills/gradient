import json,re,urllib.request,concurrent.futures as cf,xml.etree.ElementTree as ET,html,datetime as dt
from sources import YT,BLOGS
from paths import PATHS
UA={"User-Agent":"Mozilla/5.0 (GradientFeed)"}
def get(u,t=20): return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=t).read()
NS={"a":"http://www.w3.org/2005/Atom","yt":"http://www.youtube.com/xml/schemas/2015","media":"http://search.yahoo.com/mrss/"}
def yt(src):
  cid,name,tier,level,topics,note=src; out=[]
  try: root=ET.fromstring(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"))
  except Exception as e: print("FAIL",name,e); return []
  for e in root.findall("a:entry",NS)[:15]:
    vid=e.find("yt:videoId",NS).text
    desc=e.find("media:group/media:description",NS); views=e.find("media:group/media:community/media:statistics",NS)
    out.append({"kind":"video","yt":vid,"title":e.find("a:title",NS).text,"src":cid,"date":e.find("a:published",NS).text[:10],
      "views":int(views.get("views")) if views is not None else 0,"desc":(desc.text or "")[:220] if desc is not None else ""})
  return out
def is_short(v):
  try:
    req=urllib.request.Request(f"https://www.youtube.com/shorts/{v}",headers=UA,method="HEAD")
    class N(urllib.request.HTTPRedirectHandler):
      def redirect_request(self,*a,**k): return None
    try: urllib.request.build_opener(N).open(req,timeout=15); return True
    except urllib.error.HTTPError as e: return e.code==200
  except Exception: return False
def strip(s): return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",s or ""))).strip()
def pdate(s):
  from email.utils import parsedate_to_datetime
  s=(s or "").strip()
  try: return parsedate_to_datetime(s).date().isoformat()
  except Exception: return s[:10]
def blog(src):
  url,name,tier,level,topics,note=src; out=[]
  try: root=ET.fromstring(get(url))
  except Exception as e: print("FAIL",name,e); return []
  items=root.findall(".//item") or root.findall("a:entry",NS)
  for it in items:
    if it.tag=="item":
      t=it.findtext("title"); l=it.findtext("link"); d=pdate(it.findtext("pubDate") or it.findtext("{http://purl.org/dc/elements/1.1/}date")); s=it.findtext("description")
    else:
      t=it.findtext("a:title",namespaces=NS); le=it.find("a:link[@rel='alternate']",NS)
      if le is None: le=it.find("a:link",NS)
      l=le.get("href") if le is not None else ""
      d=(it.findtext("a:published",namespaces=NS) or it.findtext("a:updated",namespaces=NS) or "")[:10]; s=it.findtext("a:summary",namespaces=NS) or it.findtext("a:content",namespaces=NS)
    out.append({"kind":"read","url":l,"title":strip(t),"src":url,"date":d,"desc":strip(s)[:220]})
  out.sort(key=lambda x:x["date"],reverse=True)
  return out[:8]
with cf.ThreadPoolExecutor(16) as ex:
  vids=[i for l in ex.map(yt,YT) for i in l]
  reads=[i for l in ex.map(blog,BLOGS) for i in l]
  shorts=dict(zip([v["yt"] for v in vids],ex.map(is_short,[v["yt"] for v in vids])))
vids=[v for v in vids if not shorts[v["yt"]] and "#short" not in v["title"].lower()]
reads=[r for r in reads if not r["title"].startswith("Quoting ")]
sources=[{"id":c,"name":n,"tier":t,"level":l,"topics":tp,"note":no,"kind":"video","url":f"https://www.youtube.com/channel/{c}"} for c,n,t,l,tp,no in YT]
sources+=[{"id":u,"name":n,"tier":t,"level":l,"topics":tp,"note":no,"kind":"read","url":u} for u,n,t,l,tp,no in BLOGS]
items=sorted(vids+reads,key=lambda x:x["date"],reverse=True)
data={"generated":dt.datetime.now(dt.UTC).strftime("%Y-%m-%dT%H:%MZ"),"sources":sources,"paths":PATHS,"items":items}
json.dump(data,open("app/public/data.json","w"),ensure_ascii=False)
print(len(vids),"videos",sum(shorts.values()),"shorts dropped",len(reads),"reads", items[0]["date"], items[-1]["date"])
