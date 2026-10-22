export const fields = [
 ['surname','성','Surname','text','예. 김'],['given','이름','Given Names','text','예. 하늘'],
 ['birth','생년월일','Date of Birth','date',''],['sex','성별','Sex','select',''],
 ['place','출생지','Place of Birth','text','예. 캘거리, 에드먼턴'],['registration','등록번호','Registration No.','text','등록번호'],
 ['registered','등록일','Registration Date','date',''],['issued','발급일','Date Issued','date',''],
 ['parent1','모 성명','Name of Parent','text','한글 성명'],['parent1Place','모 출생지','Place of Birth','text','예. 대한민국'],
 ['parent2','부 성명','Name of Parent','text','한글 성명'],['parent2Place','부 출생지','Place of Birth','text','예. 대한민국']
];
export function fieldsFor(region='ab', sexDisplayed=true) {
 if (!['ab','bc'].includes(region)) throw new Error('지원하는 발급지역을 선택해 주세요.');
 return fields.filter(([key])=>region!=='bc'||sexDisplayed||key!=='sex').map(field=>{
  const copy=[...field];
  if(region==='bc'){
   const labels={parent1:'부모 1 성명',parent1Place:'부모 1 출생지',parent2:'부모 2 성명',parent2Place:'부모 2 출생지'};
   if(labels[copy[0]])copy[1]=labels[copy[0]];
   if(copy[0]==='registered')copy[2]='Date of Registration';
   if(copy[0]==='issued')copy[2]='Date of Issue';
   if(copy[0]==='place')copy[4]='예. 밴쿠버, 브리티시컬럼비아주';
   if(copy[0].endsWith('Place')){copy[2]='Birthplace of Parent';copy[4]='원본의 출생지를 한글로 입력';}
  }
  return copy;
 });
}
export function helpFor(region='ab') {
 return region==='bc'?{...help,place:'원본에 적힌 아기의 출생 도시와 주를 한글로 적어 주세요.',parent1:'원본의 첫 번째 부모 성명을 한글로 적어 주세요.',parent2:'원본의 두 번째 부모 성명을 한글로 적어 주세요.',parent1Place:'첫 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.',parent2Place:'두 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.'}:help;
}
export function koreanDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('날짜를 선택해 주세요.');const [y,m,d]=value.split('-').map(Number);const date=new Date(0);date.setUTCFullYear(y,m-1,d);if(y<1000||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)throw new Error('유효한 날짜를 선택해 주세요.');return `${y}년 ${m}월 ${d}일`;}
export function validate(data){const region=data.region||'ab';if(region==='bc'&&typeof data.sexDisplayed!=='boolean')throw new Error('원본의 성별 표시 여부를 선택해 주세요.');const activeFields=fieldsFor(region,data.sexDisplayed);for(const [key,label]of activeFields){if(!data[key]?.trim())throw new Error(`${label} 항목을 입력해 주세요.`);}for(const key of ['registrarKo','translator'])if(!data[key]?.trim())throw new Error('등록관과 번역자 이름을 입력해 주세요.');for(const key of ['birth','registered','issued'])koreanDate(data[key]);if((region!=='bc'||data.sexDisplayed)&&!(region==='bc'?['M','F','X']:['M','F']).includes(data.sex))throw new Error('성별을 선택해 주세요.');if(data.birth>data.registered||data.registered>data.issued)throw new Error('생년월일, 등록일, 발급일의 순서를 확인해 주세요.');for(const [key]of activeFields.filter(f=>f[3]==='text'&&!['registration'].includes(f[0]))){if(!/[가-힣]/u.test(data[key])||/[A-Za-z]/.test(data[key]))throw new Error('성명과 출생지는 한글로 입력해 주세요.');}for(const key of ['registrarKo','translator'])if(!/[가-힣]/u.test(data[key])||/[A-Za-z]/.test(data[key]))throw new Error('등록관 한글 표기와 번역자 이름을 확인해 주세요.');for(const value of Object.values(data))if(typeof value==='string'&&value.length>100)throw new Error('입력 내용은 항목당 100자 이내로 작성해 주세요.');return data;}
export const help={surname:'출생신고할 아기의 성을 한글로 적어 주세요.',given:'성을 제외한 아기의 이름을 한글로 적어 주세요.',birth:'아기가 태어난 날짜를 선택해 주세요.',sex:'아기의 성별을 선택해 주세요.',place:'아기가 태어난 도시를 한글로 적어 주세요.',parent1:'어머니의 성과 이름을 한글로 적어 주세요.',parent1Place:'어머니가 태어난 국가를 한글로 적어 주세요.',parent2:'아버지의 성과 이름을 한글로 적어 주세요.',parent2Place:'아버지가 태어난 국가를 한글로 적어 주세요.'};
