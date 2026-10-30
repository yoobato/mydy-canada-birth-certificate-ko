import test from 'node:test';import assert from 'node:assert/strict';
import {koreanDate,validate,sexLabel} from '../src/data.js';
const sample={surname:'김',given:'하늘',birth:'2024-02-29',sex:'F',place:'에드먼턴',registration:'TEST-0000',registered:'2024-03-01',issued:'2024-03-05',parent1:'이예시',parent1Place:'대한민국',parent2:'김예시',parent2Place:'대한민국',registrarKo:'트레버 버겐',translator:'김번역'};
test('dates remain local calendar dates, including leap day',()=>{assert.equal(koreanDate('2024-02-29'),'2024년 2월 29일');assert.throws(()=>koreanDate('2023-02-29'));assert.throws(()=>koreanDate('2024-13-01'));});
test('reject incomplete, English, and reversed dates',()=>{assert.equal(validate(sample),sample);for(const override of [{registrarKo:''},{registrarKo:'Trevor Bergen'},{birth:'2024-03-03'},{issued:'2024-02-01'},{surname:'Kim'},{sex:'X'},{translator:''}])assert.throws(()=>validate({...sample,...override}));});
test('BC parental certificate requires sex and supports explicit other text',()=>{
 const bc={...sample,region:'bc',formCode:'',place:'밴쿠버, 브리티시컬럼비아주'};
 assert.equal(validate(bc),bc);
 assert.throws(()=>validate({...bc,sex:''}));
 assert.throws(()=>validate({...bc,sex:'',sexDisplayed:false}));
 assert.throws(()=>validate({...bc,parent2:''}));
 assert.throws(()=>validate({...bc,region:'unknown'}));
 for(const region of ['bc','ab']){
  for(const value of ['X','기타 표기']){const custom={...bc,region,sex:'OTHER',sexOther:value};validate(custom);assert.equal(sexLabel(custom),value);}
  for(const sexOther of ['', '   ', 'X'.repeat(31), 'X\nY'])assert.throws(()=>validate({...bc,region,sex:'OTHER',sexOther}));
 }
 assert.equal(sexLabel({...bc,sex:'F',sexOther:'X'}),'여');
});
