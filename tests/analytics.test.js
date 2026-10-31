import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnalytics, MEASUREMENT_ID} from '../src/analytics.js';

test('only fixed telemetry is queued; user data and arbitrary event names are excluded',()=>{
  const scripts=[];const win={location:{href:'https://example.com/?name=PRIVATE#PRIVATE'},document:{referrer:'PRIVATE'}};
  const doc={createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
  const analytics=createAnalytics(win,doc,true);
  analytics.track('page_view','bc');
  analytics.track('translation_preview','ab');
  analytics.track('pdf_download','ab');
  analytics.track('preview_pdf_download','bc');
  analytics.track('support_click','bc');
  analytics.track('PRIVATE','bc');
  analytics.track('pdf_download',{name:'PRIVATE'});
  analytics.track('support_click','PRIVATE');
  analytics.track('page_view');
  const commands=win.dataLayer.map(a=>Array.from(a));
  assert.deepEqual(commands.filter(a=>a[0]==='event').map(a=>a[1]),['page_view','translation_preview','pdf_download','preview_pdf_download','support_click']);
  assert.deepEqual(commands.filter(a=>a[0]==='event').map(a=>a[2].certificate_region),['bc','ab','ab','bc','bc']);
  assert.equal(commands.find(a=>a[0]==='config')[2].page_title,'캐나다 출생증명서 번역 | BC·알버타 한글 번역문 PDF');
  assert.ok(!JSON.stringify(commands).includes('PRIVATE'));
  assert.equal(commands.find(a=>a[0]==='config')[2].send_page_view,false);
  assert.equal(commands.find(a=>a[0]==='config')[2].allow_google_signals,false);
  assert.equal(scripts[0].src,`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
  assert.equal(scripts[0].referrerPolicy,'no-referrer');
});
test('development does not load Google or queue telemetry',()=>{
  const win={};const analytics=createAnalytics(win,{createElement(){throw Error('must not load')}},false);
  analytics.track('page_view');assert.equal(win.dataLayer,undefined);
});
