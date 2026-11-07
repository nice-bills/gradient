import { chromium } from '/tmp/pwi/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs=[];
for (const [W,H,tag] of [[390,844,'m'],[1440,900,'d']]) {
  const p = await (await b.newContext({ viewport:{width:W,height:H}, deviceScaleFactor: W<500?2:1 })).newPage();
  p.on('console',m=>{if(m.type()==='error')errs.push(tag+': '+m.text())}); p.on('pageerror',e=>errs.push(tag+' PAGE: '+e.message));
  for (const [r,n] of [['#/','home'],['#/course/llms','course'],['#/bulletin','bulletin'],['#/faculty','faculty']]) {
    await p.goto('http://localhost:4180/'+r); await p.waitForTimeout(1800);
    await p.screenshot({path:`shots/${tag}-${n}.png`, fullPage:false});
  }
  await p.goto('http://localhost:4180/#/course/llms'); await p.waitForTimeout(1200);
  await p.click('.row .mark'); await p.waitForTimeout(250); await p.screenshot({path:`shots/${tag}-stamp.png`});
  await p.click('[data-hall-course]'); await p.waitForTimeout(2500); await p.screenshot({path:`shots/${tag}-hall.png`});
  await p.keyboard.press('n'); await p.keyboard.press('n'); await p.waitForTimeout(800); await p.screenshot({path:`shots/${tag}-hall-read.png`});
}
console.log(errs.join('\n')||'no errors'); await b.close();
