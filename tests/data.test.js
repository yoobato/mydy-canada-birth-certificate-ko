import test from 'node:test';import assert from 'node:assert/strict';
import {koreanDate,validate} from '../src/data.js';
const sample={surname:'김',given:'하늘',birth:'2024-02-29',sex:'F',place:'에드먼턴',registration:'TEST-0000',registered:'2024-03-01',issued:'2024-03-05',parent1:'이예시',parent1Place:'대한민국',parent2:'김예시',parent2Place:'대한민국',registrarKo:'트레버 버겐',translator:'김번역'};
test('dates remain local calendar dates, including leap day',()=>{assert.equal(koreanDate('2024-02-29'),'2024년 2월 29일');assert.throws(()=>koreanDate('2023-02-29'));assert.throws(()=>koreanDate('2024-13-01'));});
test('reject incomplete, English, and reversed dates',()=>{assert.equal(validate(sample),sample);for(const override of [{registrarKo:''},{registrarKo:'Trevor Bergen'},{birth:'2024-03-03'},{issued:'2024-02-01'},{surname:'Kim'},{sex:'X'},{translator:''}])assert.throws(()=>validate({...sample,...override}));});
test('BC parental certificate supports omitted sex without requiring or fabricating it',()=>{
 const bc={...sample,region:'bc',sexDisplayed:false,sex:'',formCode:'',place:'밴쿠버, 브리티시컬럼비아주'};
 assert.equal(validate(bc),bc);
 assert.throws(()=>validate({...bc,sexDisplayed:true}));
 assert.throws(()=>validate({...bc,sexDisplayed:undefined}));
 assert.throws(()=>validate({...bc,parent2:''}));
 assert.throws(()=>validate({...bc,region:'unknown'}));
 assert.equal(validate({...bc,sexDisplayed:true,sex:'X'}).sex,'X');
});
