import json,urllib.request,urllib.parse,concurrent.futures as cf
V="aircAruvnKk IHZwWFHWa-w Ilg3gGewQ5U tIeHLnjs5U8 wjZofJX0v4M eMlx5fFNoYc 9-Jl0dxWQs8 VMj-3S1tku0 PaCmpygFfXo TCH_1BHY58I P6sfmUTpUmc q8SA3rM6ckI kCc8FmEb1nY zduSFxRajkE l8pRSuU81PU zjkBMFhNj_g 7xTGNNLPyMI EWvNQjAaOHw bZQun8Y4L2A 2pWv7GOvuf0 LPZh9BOjkQs XfpMkf4rD6E bCz4OMemCcA ISNdQcPhsts 9vM4p9NN0Ts ptuGllU5SQQ UGO_Ehywuxc".split()
def yt(v):
  try:
    d=json.load(urllib.request.urlopen(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={v}&format=json",timeout=15))
    return v,d["title"],d["author_name"]
  except Exception as e: return v,None,str(e)[:30]
A=["https://lilianweng.github.io/posts/2023-06-23-agent/","https://jalammar.github.io/illustrated-transformer/","https://colah.github.io/posts/2015-08-Understanding-LSTMs/","https://arxiv.org/abs/1706.03762","https://transformer-circuits.pub/2021/framework/index.html","https://transformer-circuits.pub/2022/toy_model/index.html","https://transformer-circuits.pub/2024/scaling-monosemanticity/","https://hamel.dev/blog/posts/evals/","https://eugeneyan.com/writing/llm-patterns/","https://huyenchip.com/2025/01/07/agents.html","http://www.incompleteideas.net/IncIdeas/BitterLesson.html","https://karpathy.medium.com/software-2-0-a64152b37c35","https://sebastianraschka.com/blog/2023/self-attention-from-scratch.html","https://lilianweng.github.io/posts/2018-04-08-policy-gradient/","https://spinningup.openai.com/en/latest/","https://rlhfbook.com/","https://www.anthropic.com/engineering/building-effective-agents","https://karpathy.github.io/2019/04/25/recipe/","https://jax-ml.github.io/scaling-book/","https://arxiv.org/abs/2001.08361","https://arxiv.org/abs/2203.15556","https://lilianweng.github.io/posts/2024-07-07-hallucination/","https://distill.pub/2020/circuits/zoom-in/","https://simonwillison.net/2023/Apr/14/worst-that-can-happen/","https://www.anthropic.com/research/tracing-thoughts-language-model","https://course.fast.ai/","https://huggingface.co/learn/llm-course/chapter1/1","https://karpathy.github.io/2015/05/21/rnn-effectiveness/","https://lilianweng.github.io/posts/2021-07-11-diffusion-models/","https://arxiv.org/abs/2201.11903","https://arxiv.org/abs/2210.03629"]
def art(u):
  try:
    r=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=20); b=r.read(200000).decode('utf8','ignore')
    import re; t=re.search(r'<title[^>]*>(.*?)</title>',b,re.S)
    return u,r.status,t and t.group(1).strip()[:90]
  except Exception as e: return u,None,str(e)[:40]
with cf.ThreadPoolExecutor(16) as ex:
  for r in ex.map(yt,V): print(r)
  for r in ex.map(art,A): print(r)
