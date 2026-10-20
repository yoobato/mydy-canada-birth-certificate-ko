# 개발·운영 안내

## 검증과 배포

수정 후 관련 검증을 수행하고 `main`에 커밋한 뒤 `origin/main`으로 푸시합니다. GitHub Actions가 단위 테스트와 빌드를 실행하고 `dist/`를 GitHub Pages에 배포합니다. 브라우저 검증은 로컬에서 별도 실행합니다.

```sh
npm test
npm run build
# 개발 서버 실행 후
npm run test:browser
```

브라우저 검증에는 가상 데이터만 사용합니다. 결과는 Git에서 제외되는 `tmp/`에 저장되며 Google 태그는 가짜 응답으로 대체해 실제 통계 전송을 막습니다. 배포본 확인에는 `TEST_URL=https://ab-birthcert-ko.mydy.kr/ npm run test:browser`를 사용할 수 있습니다.

배포 커밋은 내비게이션 GitHub 버튼에 `#`와 짧은 SHA로 표시합니다. Actions의 `GITHUB_SHA`를 우선 사용하고 로컬에서는 Git HEAD를 읽습니다. 개발 서버의 SHA를 갱신하려면 서버를 재시작합니다.

## 도메인과 HTTPS

- 서비스: `https://ab-birthcert-ko.mydy.kr/`
- DNS: `ab-birthcert-ko`의 CNAME을 `yoobato.github.io`로 설정
- GitHub 저장소 Settings → Pages: Source는 GitHub Actions, Custom domain은 `ab-birthcert-ko.mydy.kr`, Enforce HTTPS 활성화
- 인증서는 GitHub Pages가 관리합니다. 도메인을 변경한 뒤에는 DNS·인증서·HTTP → HTTPS 리디렉션을 확인합니다.

도메인을 바꾸면 `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/analytics.js`의 고정 URL과 공유 이미지·문서도 함께 갱신합니다. Actions 배포에서는 저장소의 CNAME 파일이 필요하지 않습니다.

## Google Analytics

측정 ID는 `G-2TXN5Z7X2G`입니다. 프로덕션 빌드에서만 실행하며 로컬 개발 서버에서는 비활성화됩니다. 프로덕션 빌드를 로컬에서 미리 보는 경우에는 GA가 실행되므로 자동 확인 시 태그를 차단해야 합니다.

| 이벤트 | 발생 시점 |
| --- | --- |
| `page_view` | 페이지 방문 |
| `translation_preview` | PDF 생성에 성공하고 미리보기를 연 경우 |
| `pdf_download` | PDF 다운로드 시작, 미리보기의 저장 링크 포함 |

다운로드 이벤트는 운영체제의 파일 저장 완료를 보장하지 않습니다. GA 관리의 웹 데이터 스트림에서 **향상된 측정은 꺼둡니다**. 자동 폼·클릭 이벤트 대신 명시된 이벤트만 사용합니다.

이벤트 함수는 허용된 이름만 받습니다. 양식값·PDF·파일명·URL 쿼리와 해시·원본 리퍼러를 전달하지 않고 고정 페이지 정보만 사용합니다. Google signals와 광고 개인화는 비활성화합니다. 기본 접속 정보와 분석 쿠키는 사용될 수 있습니다.

실제 수집 확인은 배포 사이트 방문 후 GA 실시간 보고서에서 진행합니다. 광고 차단기나 브라우저 설정에 따라 수집이 차단될 수 있습니다. 서버의 전송 성공 응답과 GA 보고서 반영 여부는 구분해서 확인합니다.

## Adsterra

`src/ads.js`가 입력 양식 아래에 300×250 배너를 표시합니다. 광고 키는 `abf3cab706ccca549436cc9f2918d3ef`, 제공된 스크립트 주소는 `https://bauval.org/22/abf3cab706ccca549436cc9f2918d3ef`입니다. `atOptions.params`는 빈 객체로 유지하고 입력값·PDF·GA 데이터를 광고에 전달하지 않습니다.

광고는 `data:` URL의 iframe에서 실행합니다. `data:` 문서는 입력 화면과 다른 opaque origin을 가지므로 양식 DOM에 접근할 수 없습니다. sandbox의 `allow-same-origin`은 광고 제공업체가 내부 `about:blank` 프레임에 광고를 작성할 수 있도록 유지합니다. **`srcdoc`, `blob:` 또는 같은 사이트 URL로 바꾸면서 이 권한을 유지하면 입력값 격리가 깨질 수 있으므로 금지합니다.** 상위 페이지 이동·양식 제출 권한은 부여하지 않습니다. 광고 링크는 새 창에서 열 수 있습니다. 광고가 차단되거나 로드되지 않아도 입력·미리보기·다운로드를 이용할 수 있으며 광고는 PDF에 포함하지 않습니다.

개발 서버에서는 광고 프레임을 생성하지 않습니다. 프로덕션 빌드의 브라우저 테스트에서는 스크립트를 테스트 응답으로 대체해 실제 광고 요청을 막고, 프레임의 입력값 접근 차단과 레이아웃을 확인합니다. 프로덕션 빌드를 수동으로 미리 볼 때도 광고 스크립트를 차단해야 합니다.

이 서비스의 기존 AdSense 로더와 계정 메타 태그는 제거했습니다. 루트 `mydy.kr`의 광고 설정은 별도 저장소에서 관리합니다. 배너의 실제 공급·광고 분류·지역별 동의 설정은 Adsterra 계정에서 관리합니다.

## 검색과 링크 공유

`index.html`에 title·description·canonical·robots·Open Graph·X 카드 정보와 WebApplication JSON-LD가 있습니다. 메타데이터는 JavaScript 실행 전 HTML에서 읽을 수 있습니다. 초기 안내는 앱 실행 후 입력 화면으로 교체되고, JavaScript가 꺼져 있으면 사용 안내가 남습니다.

- 대표 URL: `https://ab-birthcert-ko.mydy.kr/`
- 사이트맵: `https://ab-birthcert-ko.mydy.kr/sitemap.xml`
- 공유 이미지: `https://ab-birthcert-ko.mydy.kr/og-image.png` (1200 × 630 PNG)

공유 이미지는 개인정보와 공식 관인 없이 구성합니다. 문구나 디자인 수정 후 다음 명령으로 다시 생성하고 PNG도 함께 커밋합니다.

```sh
node scripts/generate-og-image.mjs
```

Google Search Console에 사이트 소유권을 인증하고 사이트맵을 제출하면 색인 상태를 확인할 수 있습니다. 현재 저장소 설정만으로 Search Console 인증·제출이 완료되는 것은 아닙니다. 검색 노출과 공유 카드 표시는 각 플랫폼이 결정하며, 기존 공유 URL은 플랫폼 캐시 때문에 갱신이 늦을 수 있습니다.

## 참고 문서

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Open Graph 규격](https://ogp.me/)
- [GitHub Pages 도메인 문제 해결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

## 라이선스 고지 갱신

의존성 변경 후 `npm ci`로 설치하고 `node scripts/generate-notices.mjs`를 실행합니다. `THIRD_PARTY_NOTICES.md`와 배포용 `public/THIRD_PARTY_NOTICES.txt`를 함께 커밋합니다. 현재 플랫폼에 설치된 패키지의 원문을 수집하므로 선택적 네이티브 패키지는 플랫폼에 따라 달라질 수 있습니다. npm 패키지에 내장된 코드의 추가 고지는 별도로 검토합니다. fontkit은 독립 LICENSE 파일이 없어 배포 번들의 라이선스 주석과 MIT 선언을 기록합니다.

프로젝트 자체에 오픈소스 라이선스를 부여하는 결정은 저작권자가 별도로 내립니다. 정부 로고·외부 서비스·글꼴의 조건을 프로젝트 라이선스로 대체하지 않습니다.
