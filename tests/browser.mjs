import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
await mkdir('tmp',{recursive:true});
const base=process.env.TEST_URL || 'http://127.0.0.1:5178/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1200}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push(r.url()));
await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({contentType:'application/javascript',body:'/* Analytics intercepted for QA; nothing sent to Google. */'}));
const adKeys = ['07be985bbc89fc630c8c7e3055ec8e9b','dff941cbd01aff06f3fbce0c34fa0967','abf3cab706ccca549436cc9f2918d3ef'];
const adScripts = adKeys.map(key=>'https://bauval.org/22/'+key);
await page.route('https://bauval.org/**',route=>{
  assert.ok(adScripts.includes(route.request().url()));
  return route.fulfill({contentType:'application/javascript',body:`
    try { parent.document.querySelector('#surname'); document.body.dataset.isolated='false'; }
    catch { document.body.dataset.isolated='true'; }
    const {width,height}=atOptions;
    const nested=document.createElement('iframe');
    nested.width=width;nested.height=height;nested.style.border='0';
    document.body.append(nested);
    const creative=nested.contentDocument;
    if(!creative)throw new Error('Nested ad frame is inaccessible');
    creative.open();
    creative.write('<body style="margin:0;background:#e7ece4;color:#526e61;font:14px sans-serif;display:grid;place-items:center;width:'+width+'px;height:'+height+'px"><div id="test-creative">Ad test · '+width+' × '+height+'</div></body>');
    creative.close();
  `});
});
async function checkAds(width) {
  if(!await page.locator('.advertisement').count()) return;
  assert.equal(await page.locator('.advertisement').count(),2);
  const slots=['.advertisement-top','.advertisement-rectangle'];
  const sizes=[[width>=800?728:320,width>=800?90:50],[300,250]];
  const keys=[];
  for(let i=0;i<slots.length;i++){
    const ad=page.locator(slots[i]+' iframe');
    const frame=page.frameLocator(slots[i]+' iframe');
    await frame.locator('body[data-isolated="true"]').waitFor();
    await frame.frameLocator('iframe').locator('#test-creative').waitFor();
    const sandbox=await ad.getAttribute('sandbox');
    assert.ok(sandbox.includes('allow-same-origin'));
    assert.ok(!sandbox.includes('allow-top-navigation'));
    assert.match(await ad.getAttribute('src'),/^data:text\/html;charset=utf-8,/);
    assert.equal(await ad.getAttribute('srcdoc'),null);
    assert.equal(await ad.evaluate(f=>f.contentDocument),null);
    assert.equal(await ad.getAttribute('width'),String(sizes[i][0]));
    assert.equal(await ad.getAttribute('height'),String(sizes[i][1]));
    keys.push(await frame.locator('body').evaluate(()=>atOptions.key));
    const box=await ad.boundingBox();
    assert.ok(box.x>=0&&box.x+box.width<=width,`Ad overflows at ${width}px`);
  }
  assert.deepEqual(keys,[adKeys[width>=800?0:1],adKeys[2]]);
  assert.equal(new Set(keys).size,2);
  assert.equal(await page.locator('.sidebar .advertisement-rectangle').count(),1);
  if(width>=352){
    const top=await page.locator('.advertisement-top').boundingBox();
    const workspace=await page.locator('.workspace').boundingBox();
    assert.ok(Math.abs(top.x-workspace.x)<1,'Top ad left edge must align with form');
    assert.ok(Math.abs(top.x+top.width-workspace.x-workspace.width)<1,'Top ad right edge must align with form');
  }
}
await page.goto(base);await page.evaluate(()=>document.fonts.ready);await checkAds(1440);
await page.screenshot({path:'tmp/desktop.png',fullPage:true});
assert.ok(!requests.includes(adScripts[1]),'Mobile ad must not be loaded on desktop');
const values={registrarKo:'트레버 버겐',surname:'김',given:'하늘',birth:'2024-02-29',place:'에드먼턴',registration:'TEST-2024-000001',registered:'2024-03-01',issued:'2024-03-05',parent1:'이예시',parent1Place:'대한민국',parent2:'김예시',parent2Place:'대한민국',translator:'김번역',serial:'AB00000000'};
for(const [key,value]of Object.entries(values))await page.locator('#'+key).fill(value);
await page.locator('#sex').selectOption('F');assert.equal(await page.locator('#registrarKo').inputValue(),'트레버 버겐');assert.equal(await page.locator('#count').innerText(),'14 / 14');
await page.locator('#preview').click();await page.waitForFunction(()=>document.querySelector('#dialog').open);await page.locator('#close').click();
const wait=page.waitForEvent('download');await page.locator('#download').click();const download=await wait;await download.saveAs('tmp/example.pdf');
const events=await page.evaluate(()=>Array.from(window.dataLayer||[]).filter(a=>a[0]==='event').map(a=>a[1]));if(events.length)assert.deepEqual(events,['page_view','translation_preview','pdf_download']);const queued=await page.evaluate(()=>JSON.stringify(Array.from(window.dataLayer||[])));for(const value of Object.values(values))assert.ok(!queued.includes(value));
await page.locator('#registered').fill('2024-02-28');await page.locator('#download').click();assert.match(await page.locator('#status').innerText(),/순서/);
await page.locator('#registered').fill('2024-03-01');await page.locator('#registrarKo').fill('Trevor Bergen');await page.locator('#download').click();assert.match(await page.locator('#status').innerText(),/한글/);
await page.reload();assert.equal(await page.locator('#surname').inputValue(),'');
for(const width of [1101,1000,800,799,760,390,375,320]){
  await page.setViewportSize({width,height:844});await checkAds(width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Page overflows at ${width}px`);
}
await page.setViewportSize({width:390,height:844});await checkAds(390);
await page.screenshot({path:'tmp/mobile.png',fullPage:true});
assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('blob:')||url.startsWith('https://www.googletagmanager.com/gtag/js?id=G-2TXN5Z7X2G')||adScripts.includes(url)||url.startsWith('data:text/html;')||url==='about:blank'));assert.ok(!requests.some(url=>url.includes('googlesyndication.com')));console.log('PASS: isolated advertising, desktop, mobile, privacy, preview, PDF download, validation, reset');await browser.close();
