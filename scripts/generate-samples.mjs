import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createPdf} from '../src/pdf.js';
const root=new URL('../',import.meta.url);
const font=await readFile(new URL('public/fonts/NanumGothic-Regular.ttf',root));
const shared={surname:'홍',given:'예시',birth:'2024-02-29',sex:'F',registered:'2024-03-02',issued:'2024-03-10',parent1:'김가상',parent1Place:'대한민국',parent2:'홍가상',parent2Place:'대한민국',registrarKo:'예시 등록관',translator:'샘플 번역자'};
await mkdir(new URL('public/samples/',root),{recursive:true});
for(const [filename,values]of [
 ['bc-sample.pdf',{region:'bc',place:'밴쿠버',formCode:'VSA 434 (24/04)',registration:'SAMPLE-BC-0000',serial:'SAMPLE-BC-0000'}],
 ['alberta-sample.pdf',{region:'ab',place:'캘거리',formCode:'DVS 3413 (2026/01)',registration:'SAMPLE-AB-0000',serial:'SAMPLE-AB-0000'}],
]){
 const bytes=await createPdf({...shared,...values},font,{sample:true});
 await writeFile(new URL('public/samples/'+filename,root),bytes);
 console.log('Generated fictional sample:',filename);
}
