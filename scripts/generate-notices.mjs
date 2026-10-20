import {readFile, readdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const lock=JSON.parse(await read('package-lock.json'));
const runtime=new Set(['pdf-lib','@pdf-lib/fontkit','@pdf-lib/standard-fonts','@pdf-lib/upng','pako','tslib']);
let out='# Third-party notices\n\n이 파일은 `node scripts/generate-notices.mjs`로 설치된 패키지에서 생성합니다. 버전 기준은 package-lock.json입니다. 현재 플랫폼에 설치되지 않은 선택적 네이티브 패키지는 원문 수집 대상에 포함되지 않습니다. 각 패키지에 포함된 라이선스·NOTICE 원문을 보존하며, 번들 내부의 개별 구성요소에는 추가 조건이 적용될 수 있습니다.\n\n';
const records=[];
for(const path of Object.keys(lock.packages).sort()){
 if(!path||!existsSync(new URL(path+'/package.json',root)))continue;
 const pkg=JSON.parse(await read(path+'/package.json'));records.push({path,pkg});
}
out+='## Packages\n\n| Package | Version | Declared license | Use |\n| --- | --- | --- | --- |\n';
for(const {pkg}of records)out+=`| ${pkg.name} | ${pkg.version} | ${pkg.license||'See package'} | ${runtime.has(pkg.name)?'Browser PDF runtime':'Build / test tooling'} |\n`;
async function collect(path){let files=[];for(const d of await readdir(new URL(path,root),{withFileTypes:true})){if(d.name==='node_modules')continue;const p=path+'/'+d.name;if(d.isDirectory())files.push(...await collect(p));else if(/license|notice|copying/i.test(d.name))files.push(p);}return files.sort();}
for(const {path,pkg}of records){out+=`\n## ${pkg.name} ${pkg.version}\n\n`;const files=await collect(path);for(const file of files)out+=`### ${file.slice(path.length+1)}\n\n\`\`\`text\n${await read(file)}\n\`\`\`\n`;
 if(pkg.name==='@pdf-lib/fontkit'){
 out+='The distributed package declares MIT in package.json; its README links to https://choosealicense.com/licenses/mit/. Author: Andrew Dillon. Contributor and upstream author: Devon Govett. The package does not ship a standalone LICENSE file. Its bundled source retains the following notices (including Apache-2.0 Brotli code and MIT components).\n\n';
 const mit=await read('node_modules/pdf-lib/LICENSE.md');
 out+='### MIT permission terms\n\n```text\n'+mit.slice(mit.indexOf('Permission is hereby granted'))+'\n```\n';
 const source=await read(path+'/dist/fontkit.es.js');const comments=source.match(/\/\*[\s\S]*?\*\/|(?:^[ \t]*\/\/[^\n]*\n)+/gm)||[];
 for(const c of new Set(comments.filter(c=>/copyright|licensed under|permission is hereby/i.test(c))))out+='```text\n'+c+'\n```\n';
 }
 if(pkg.name==='pako'){const src=await read(path+'/lib/zlib/deflate.js');out+='### Zlib source notice\n\n```text\n'+src.slice(src.indexOf('// (C)'),src.indexOf('\nvar utils')).trim()+'\n```\n';}
}
out+='\n## Nanum Gothic\n\nSource: public/fonts/OFL.txt. Used in the webpage, PDF output and share-card rendering.\n\n```text\n'+await read('public/fonts/OFL.txt')+'\n```\n';
out+='\n## External artwork and services\n\nAlberta Canada wordmark: Government of Alberta Visual Identity Manual (2018), section 2.2.3.1. Source: https://open.alberta.ca/dataset/ed5f57ac-9484-4f8c-94ed-99a808fa2248/resource/d81424b8-d293-4032-acb8-6334429159b8/download/visual-identity-manual.pdf . Government marks are not covered by the software licenses above; inclusion does not imply endorsement or grant trademark rights.\n\nGoogle Analytics and Adsterra advertising are externally loaded services and are not licensed by this repository. Their own service terms apply.\n';
await writeFile(new URL('THIRD_PARTY_NOTICES.md',root),out);
await writeFile(new URL('public/THIRD_PARTY_NOTICES.txt',root),out);
console.log(`Generated notices for ${records.length} installed packages and Nanum Gothic.`);
