import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
await mkdir('tmp',{recursive:true});
const base=process.env.TEST_URL || 'http://127.0.0.1:5178/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1200}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push(r.url()));
await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({contentType:'application/javascript',body:'/* Analytics intercepted for QA; nothing sent to Google. */'}));
const adScript='https://bauval.org/22/abf3cab706ccca549436cc9f2918d3ef';
await page.route(adScript,route=>route.fulfill({contentType:'application/javascript',body:`
  try { parent.document.querySelector('#surname'); document.body.dataset.isolated='false'; }
  catch { document.body.dataset.isolated='true'; }
  const nested=document.createElement('iframe');
  nested.width=300;nested.height=250;nested.style.border='0';
  document.body.append(nested);
  // The provider writes its creative into an about:blank child frame.
  const creative=nested.contentDocument;
  if(!creative)throw new Error('Nested ad frame is inaccessible');
  creative.open();
  creative.write('<body style="margin:0;background:#e7ece4;color:#526e61;font:14px sans-serif;display:grid;place-items:center;width:300px;height:250px"><div id="test-creative">Ad test · 300 × 250</div></body>');
  creative.close();
  document.body.dataset.creative='ready';
`}));
await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'tmp/desktop.png',fullPage:true});
const ad=page.locator('.advertisement iframe');
if(await ad.count()){
  await page.frameLocator('.advertisement iframe').locator('body[data-isolated="true"]').waitFor();
  const sandbox=await ad.getAttribute('sandbox');
  assert.ok(sandbox.includes('allow-same-origin'));
  assert.match(await ad.getAttribute('src'),/^data:text\/html;charset=utf-8,/);
  assert.equal(await ad.getAttribute('srcdoc'),null);
  await page.frameLocator('.advertisement iframe').frameLocator('iframe').locator('#test-creative').waitFor();
  assert.equal(await ad.evaluate(f=>f.contentDocument),null);
  assert.ok(!sandbox.includes('allow-top-navigation'));
  assert.equal(await ad.getAttribute('width'),'300');
  assert.equal(await ad.getAttribute('height'),'250');
}
const values={registrarKo:'트레버 버겐',surname:'김',given:'하늘',birth:'2024-02-29',place:'에드먼턴',registration:'TEST-2024-000001',registered:'2024-03-01',issued:'2024-03-05',parent1:'이예시',parent1Place:'대한민국',parent2:'김예시',parent2Place:'대한민국',translator:'김번역',serial:'AB00000000'};
for(const [key,value]of Object.entries(values))await page.locator('#'+key).fill(value);
await page.locator('#sex').selectOption('F');assert.equal(await page.locator('#registrarKo').inputValue(),'트레버 버겐');assert.equal(await page.locator('#count').innerText(),'14 / 14');
await page.locator('#preview').click();await page.waitForFunction(()=>document.querySelector('#dialog').open);await page.locator('#close').click();
const wait=page.waitForEvent('download');await page.locator('#download').click();const download=await wait;await download.saveAs('tmp/example.pdf');
const events=await page.evaluate(()=>Array.from(window.dataLayer||[]).filter(a=>a[0]==='event').map(a=>a[1]));if(events.length)assert.deepEqual(events,['page_view','translation_preview','pdf_download']);const queued=await page.evaluate(()=>JSON.stringify(Array.from(window.dataLayer||[])));for(const value of Object.values(values))assert.ok(!queued.includes(value));
await page.locator('#registered').fill('2024-02-28');await page.locator('#download').click();assert.match(await page.locator('#status').innerText(),/순서/);
await page.locator('#registered').fill('2024-03-01');await page.locator('#registrarKo').fill('Trevor Bergen');await page.locator('#download').click();assert.match(await page.locator('#status').innerText(),/한글/);
await page.reload();assert.equal(await page.locator('#surname').inputValue(),'');
if(await ad.count())await page.frameLocator('.advertisement iframe').frameLocator('iframe').locator('#test-creative').waitFor();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('blob:')||url.startsWith('https://www.googletagmanager.com/gtag/js?id=G-2TXN5Z7X2G')||url===adScript||url.startsWith('data:text/html;')||url==='about:blank'));assert.ok(!requests.some(url=>url.includes('googlesyndication.com')));console.log('PASS: isolated advertising, desktop, mobile, privacy, preview, PDF download, validation, reset');await browser.close();
