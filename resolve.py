import re,json,urllib.request,concurrent.futures as cf
H=["karpathy","3blue1brown","YannicKilcher","aiexplained-official","umarjamilai","howardjeremyp","stanfordonline","AAmini","statquest","WelchLabsVideo","MachineLearningStreetTalk","DwarkeshPatel","LatentSpacePod","anthropic-ai","Google_DeepMind","TwoMinutePapers","gpumode","SebastianRaschka","ArtemKirsanov","Eigensteve","neelnanda2469","aiDotEngineer","SimonsInstituteTOC","Computerphile","SerranoAcademy","HuggingFace","bycloudAI","samwitteveenai","AndrejKarpathy","mutualinformation","alexanderamini","CodeEmporium","sentdex","EdanMeyer","ritvikmath","TrelisResearch","jbhuang0604","Stanford","cmu-lti"]
def get(h):
  try:
    r=urllib.request.urlopen(urllib.request.Request(f"https://www.youtube.com/@{h}",headers={"User-Agent":"Mozilla/5.0","Accept-Language":"en"}),timeout=20).read().decode('utf8','ignore')
    cid=re.search(r'"externalId":"(UC[\w-]{22})"',r) or re.search(r'channel_id=(UC[\w-]{22})',r)
    name=re.search(r'<meta property="og:title" content="([^"]+)"',r)
    return h,cid and cid.group(1),name and name.group(1)
  except Exception as e: return h,None,str(e)[:40]
with cf.ThreadPoolExecutor(12) as ex:
  res=list(ex.map(get,H))
for r in res: print(r)
json.dump(res,open("channels_raw.json","w"))
