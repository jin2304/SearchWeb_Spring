# ReLink GTM 및 GA4 도입 계획

최종 수정일: 2026-06-20

## 1. 목표와 제품 방향

ReLink는 단순한 저장 도구가 아니라, 사용자가 링크를 `저장 → 구조화 → 탐색 → 재사용`할 수 있게 돕는 **AI 링크 관리 서비스**로 포지셔닝한다.

- 한국어 서비스의 canonical 도메인은 `https://relink.ai.kr`이다.
- 초기 목표는 자연 검색 유입, 서비스 인지도, 회원가입 증가다.
- 공개 랜딩·기능·활용 사례·정책 페이지만 색인한다.
- 로그인, 개인 대시보드, 인증, API 영역은 색인하지 않는다.
- 현재 제공 기능만 홍보하고 팀 공유, Chrome 가져오기, 통계 등 예정 기능은 출시 후 SEO 페이지를 추가한다.

## 2. 페르소나 결정

PRD의 제품 페르소나는 특정 직업이 아니라 다음 행동을 가진 사용자다.

- 한 달에 10개 이상의 링크를 저장한다.
- 저장한 링크를 다시 찾는 데 어려움을 겪는다.
- 폴더, 태그, 검색을 이용해 자료를 재사용할 필요가 있다.

초기 SEO 획득 페르소나는 다음 순서로 공략한다.

1. **업무 리서치형 지식노동자:** PM, 서비스 기획자, 마케터, 리서처
2. **개발자·기술 학습자:** 기술 문서와 개발 아티클을 축적하는 사용자
3. **대학생·취업준비생:** 과제, 학습, 취업 자료를 모으는 사용자
4. **디자이너:** 이미지 미리보기와 시각적 컬렉션 기능 강화 후 확대

첫 번째 랜딩과 활용 사례는 업무 리서치형 사용자의 다음 문제에 집중한다.

- 업무 중 찾은 링크가 여러 브라우저와 메신저에 흩어진다.
- 저장했지만 제목이나 위치를 기억하지 못한다.
- 폴더 정리와 태그 입력이 귀찮아 정리를 중단한다.
- 나중에 필요한 자료를 검색·필터링해 다시 활용하고 싶다.

## 3. 키워드 전략

키워드를 많이 넣는 방식은 사용하지 않는다. 한 페이지가 하나의 대표 검색 의도를 담당하고, 연관 표현은 본문에 자연스럽게 사용한다.

### 핵심 키워드군

| 우선순위 | 대표 키워드 | 역할 |
| --- | --- | --- |
| 1 | 링크 관리, 링크 관리 도구, AI 링크 관리 | 서비스의 상위 카테고리와 대표 포지셔닝 |
| 2 | 북마크 관리, 북마크 정리, AI 북마크 관리 | 사용자가 익숙하게 검색하는 동의어군 |
| 3 | 링크 자동 분류, 북마크 자동 분류, AI 자동 태깅 | 현재 차별 기능 |
| 보조 | 업무 자료 관리, 리서치 링크 관리, 저장한 링크 찾기 | 활용 사례와 콘텐츠 확장 |

`지식 관리 도구`는 경쟁 범위가 넓으므로 초기 대표 키워드가 아니라 보조 문맥으로 사용한다. `meta keywords`는 검색 성과의 핵심 수단으로 취급하지 않는다.

### URL별 검색 의도

| URL | 대표 검색 의도 |
| --- | --- |
| `/` | AI 링크 관리 서비스, 링크 관리 도구 |
| `/features` | 북마크 관리, 링크 자동 분류, AI 자동 태깅 |
| `/use-cases/work-research` | 업무 자료 링크 관리, 리서치 링크 관리 |
| `/use-cases/developers` | 개발 자료 북마크 관리, 기술 문서 링크 정리 |
| `/blog/*` | 북마크 정리 방법, 저장한 링크 다시 찾기 등 문제 해결형 검색 |

페이지별로 대표 키워드군 1개와 연관 표현 3~8개를 사용하며, 같은 검색 의도를 여러 페이지에 중복 배정하지 않는다.

## 4. 한국 우선·글로벌 확장 전략

### 현재

- `https://relink.ai.kr`에서 한국어 콘텐츠만 제공하고 색인한다.
- `lang="ko"`와 `ko_KR` Open Graph locale을 유지한다.
- title, description, 본문, 정책 문서도 한국어로 완성한다.

### 글로벌 준비

- 글로벌용 일반 도메인을 지금 확보하되, 영어 출시 전에는 동일 한국어 콘텐츠를 복제해 공개하지 않는다.
- 영어 출시 시 일반 도메인에 `/ko/`, `/en/` 언어 경로를 둔다.
- 각 언어 페이지는 자체 canonical과 `hreflang`을 사용한다.
- 글로벌 전환 검증 후 `relink.ai.kr/*`를 일반 도메인의 `/ko/*` 대응 URL로 301 이전한다.
- 글로벌 도메인의 실제 이름은 확보 시 별도 기록하되 현재 한국 SEO 구현을 막지 않는다.

## 5. 색인 정책

### 색인 대상

- `/`
- `/features`
- `/use-cases/work-research`
- `/use-cases/developers`
- `/privacy`
- `/terms`
- 실제 콘텐츠가 준비된 `/blog/*`

### 색인 제외

- `/login`
- `/my-links`
- `/auth/*`
- `/api/*`
- OAuth callback

`/login`은 sitemap에서 제거한다. 검색엔진이 `noindex`를 읽을 수 있도록 robots.txt에서 막지 않고 페이지 metadata의 `noindex, follow`를 사용한다. 개인 데이터 영역인 `/my-links`는 인증 보호와 `noindex, nofollow`를 함께 적용한다.

## 6. 기술 구현 계획

### 도메인과 메타데이터

- `metadataBase`, Open Graph URL, JSON-LD URL, `robots.ts`, `sitemap.ts`를 `https://relink.ai.kr`로 통일한다.
- 공통 URL은 `NEXT_PUBLIC_SITE_URL` 또는 서버 전용 site URL 설정에서 읽어 중복 하드코딩을 제거한다.
- `/`에는 고유 title, description, canonical을 설정한다.
- OG 이미지는 단순 로고가 아닌 1200x630 서비스 공유 이미지로 제공한다.
- 현재 client component인 랜딩에서 정적 콘텐츠와 metadata를 서버 컴포넌트로 분리한다.

### robots와 sitemap

- sitemap에는 indexable canonical URL만 포함한다.
- `/login`과 모든 비공개 경로를 sitemap에서 제외한다.
- `lastModified`는 단순 빌드 시각 대신 실제 콘텐츠 수정 시각을 사용한다.
- 배포 후 `/robots.txt`와 `/sitemap.xml`의 상태 코드와 Content-Type을 확인한다.

### 구조화 데이터

- 홈에 `WebSite`와 `Organization` 또는 `SoftwareApplication` JSON-LD를 적용한다.
- 실제 공개 검색 기능이 없으므로 `SearchAction`은 추가하지 않는다.
- 화면에 표시하지 않는 기능이나 평점은 구조화 데이터에도 넣지 않는다.
- Google Rich Results Test로 JSON 파싱 오류를 검증한다.

### 공개 콘텐츠

첫 달에는 다음 페이지를 우선 제작한다.

1. `/features`
2. `/use-cases/work-research`
3. `/privacy`
4. `/terms`

다음 순서로 `/use-cases/developers`와 문제 해결형 콘텐츠를 추가한다. 운영 기본값은 월 2~4개이며, 글 수보다 실제 기능·사용 예시·비교 기준의 정확성을 우선한다.

## 7. 측정 도구

### Google Search Console

Google 검색에서 페이지가 색인됐는지, 어떤 검색어로 노출·클릭됐는지 확인한다.

- Domain property로 `relink.ai.kr` 등록
- DNS 소유권 확인
- sitemap 제출
- URL Inspection과 Page Indexing 오류 확인
- 검색어별 노출, 클릭, CTR, 평균 순위 측정

### 네이버 서치어드바이저

네이버 검색의 사이트 수집과 노출 상태를 확인한다.

- 사이트 소유 확인
- robots.txt와 sitemap 제출
- 수집 요청과 오류 확인

### GA4

검색 유입 후 사용자가 회원가입과 핵심 행동을 완료했는지 측정한다.

- `sign_up_start`
- `sign_up`
- `first_link_saved`
- 자연 검색 세션의 회원가입 전환율
- 가입 후 첫 링크 저장 완료율

Search Console과 서치어드바이저는 검색 노출 이전 단계를, GA4는 방문 이후 행동을 측정한다.

## 8. 단계별 실행

### Phase 0 - 결정 완료

- canonical 도메인: `https://relink.ai.kr`
- 대표 포지셔닝: AI 링크 관리 서비스
- 초기 획득 페르소나: 업무 리서치형 지식노동자
- 1순위 키워드: 링크 관리 계열
- 2순위 키워드: 북마크 관리·정리 계열
- 서비스 언어: 한국어 우선
- 콘텐츠 운영 기본값: 월 2~4개
- 측정 도구: Search Console, 네이버 서치어드바이저, GA4

### Phase 1 - 기술 정합성

- 모든 URL 기준을 `relink.ai.kr`로 통일한다.
- `/login`을 sitemap에서 제거한다.
- canonical, robots, noindex 정책을 정리한다.
- `/privacy`, `/terms`를 실제 URL로 연결한다.

### Phase 2 - 랜딩 최적화

- 페이지별 metadata와 OG 이미지를 적용한다.
- 랜딩 핵심 콘텐츠를 서버 렌더링한다.
- 현재 기능을 기준으로 H1, H2, 본문 카피를 정리한다.
- JSON-LD와 Core Web Vitals를 검증한다.

### Phase 3 - 검색 유입 확장

- 기능 페이지와 업무 리서치 활용 사례를 먼저 공개한다.
- 개발자 활용 사례와 문제 해결형 콘텐츠를 월 2~4개 범위에서 추가한다.
- 각 페이지에 고유 title, description, canonical과 내부 링크를 제공한다.

### Phase 4 - 등록과 측정

- Search Console과 네이버 서치어드바이저에 sitemap을 제출한다.
- GA4 가입 및 첫 링크 저장 전환을 연결한다.
- 최초 4주는 기준선을 수집하고 이후 월 단위로 노출, 클릭, CTR, 가입 전환을 비교한다.

## 9. 완료 기준

- `/robots.txt`와 `/sitemap.xml`이 정상 응답한다.
- sitemap에는 공개 canonical URL만 포함된다.
- `/login`, `/my-links`, `/auth/*`, `/api/*`는 sitemap에 없다.
- 공개 페이지마다 고유 title, description, canonical, H1이 있다.
- Search Console과 네이버 서치어드바이저에서 sitemap 오류가 없다.
- GA4에서 자연 검색 유입, 회원가입, 첫 링크 저장 전환을 구분할 수 있다.
- 주요 랜딩 콘텐츠는 JavaScript 실행 전 HTML에 포함된다.
- 모바일 기준 LCP 2.5초 이하, INP 200ms 미만, CLS 0.1 미만을 목표로 한다.

## 10. 남은 비차단 의사결정

- 글로벌 일반 도메인의 실제 이름
- 유료 요금제 확정 후 `/pricing` 공개 여부
- 팀 공유, Chrome 가져오기, 통계 기능 출시 시점과 각 기능의 SEO 공개 페이지 추가 시점

이 항목들은 현재 한국어 SEO Phase 1~4 진행을 막지 않는다.

## 11. 구현 현황

기준일: 2026-06-20

### 애플리케이션 구현 완료

- 기준 도메인과 URL 생성 로직을 `https://relink.ai.kr`로 통합
- 공통 metadata, canonical, Open Graph, Twitter Card 적용
- 검색 엔진용 1200x630 공유 이미지 생성
- `/robots.txt`, `/sitemap.xml` 정적 생성
- `/login`, `/my-links`, `/auth/*`에 noindex 정책 적용
- `WebSite`, `SoftwareApplication` JSON-LD 적용
- 랜딩 페이지 핵심 콘텐츠 서버 렌더링
- 프로덕션 빌드와 정적 내보내기 검증
- 데스크톱·모바일 화면, canonical, H1, 색인 정책 검증
- 구글 태그 관리자(GTM) 및 GA4 연동: `layout.tsx`에 GoogleTagManager 컴포넌트 탑재 및 배포 워크플로우에 자동 환경 변수 주입 구성 완료
- GA4 이벤트 연동: `src/lib/analytics.ts` 모듈을 구축하여 GTM dataLayer 전송 환경과 제품 행동 이벤트(`login`, `sign_up`, `search`, `bookmark_saved` 등) 기본 구조 설계 및 연동 완료
- (보류) `/features`, `/use-cases/*`, `/privacy`, `/terms` 페이지들: 개발 완료 후 이번 배포 범위에서 보류하여 Git Stash에 보관 (향후 추가 배포 예정)

### 배포 환경 설정 (완료)

프로덕션 배포 및 GA4 실적용을 위해 CI/CD 빌드 시점에 다음 프로덕션 환경 변수가 주입된다.

```env
NEXT_PUBLIC_SITE_URL=https://relink.ai.kr
NEXT_PUBLIC_GTM_ID=GTM-WR9ZVNQL
NEXT_PUBLIC_BACKEND_ORIGIN=https://relink.ai.kr
GOOGLE_SITE_VERIFICATION=발급된_구글_인증값
NAVER_SITE_VERIFICATION=발급된_네이버_인증값
```

### 외부 서비스 등록 (향후 과제 - Phase 4)

1. Google Analytics 4 속성을 생성하고 측정 ID를 배포 환경 변수에 입력한다.
2. Google Search Console에서 `relink.ai.kr` 도메인 속성을 만들고 DNS 소유권을 인증한다.
3. 네이버 서치어드바이저에서 사이트를 등록하고 소유권을 인증한다.
4. 양쪽 검색 도구에 `https://relink.ai.kr/sitemap.xml`을 제출한다.
5. 배포 후 URL 검사에서 `/` 페이지의 색인 요청을 진행한다. (보류된 서브 페이지들은 추후 배포 완료 시 색인 요청 진행)

### 후속 보완

- 실제 신규 가입과 기존 회원 로그인을 구분할 수 있도록 백엔드 응답을 보완한 뒤 `sign_up` 이벤트를 추가한다.
- 개인정보처리방침과 이용약관에 운영자 정보, 문의처, 보관 기간을 확정해 반영하고 법률 검토한다.
- 배포 후 Search Console Core Web Vitals 실측값을 4주간 수집한다.
- **백엔드 로그 설계 방향성 수립:** 비즈니스 결과물의 무결성 검증을 위한 자체 `event_log` 테이블 스키마를 구성하고, 성능 영향을 최소화하도록 비동기(@Async) 이벤트 처리 구조를 적용하며, JSONB 포맷을 활용해 신뢰할 수 있는 비즈니스 완료 이벤트(가입 완료, 저장 성공, AI 처리 성공 등)의 원천 데이터 수집을 설계한다.

