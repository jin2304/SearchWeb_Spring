# ReLink OpenGraph 이미지 주소 오류 해결 커밋 계획서

본 계획서는 `docs/Backend/01. backend-convention.md`에 정의된 커밋 규칙(파일명 명시, 상세 설명 유지, 명사형 종결)을 준수하여 작성되었습니다.

---

## 1. 커밋 개요
외부 SNS에서 링크 공유 시 오픈 그래프(OG) 및 트위터 카드 이미지가 깨지거나 노출되지 않는 오류를 해결하기 위한 커밋 계획입니다. `metadataBase` 속성을 정의하여 절대 경로 URL이 생성되도록 조치하고, 로컬 개발 환경 포트(4000)를 기본 fallback값으로 추가 지원합니다.

* **Commit**: `fix(frontend): SNS 공유 이미지 미노출 오류 해결 및 로컬 개발 포트(4000) 바인딩 보강`

---

## 2. 세부 작업 내역
* **대상 파일**:
  * `frontend/src/lib/config/site.ts`
  * `frontend/src/app/layout.tsx`
  * `frontend/src/lib/seo/metadata.ts`

* **상세 작업 내역**:
  * `site.ts`: 로컬 개발용 포트 매핑 보강: 환경 변수(`NEXT_PUBLIC_SITE_URL`)가 정의되지 않은 개발 모드(`development`) 환경일 때, Next.js의 기본값(3000) 대신 서비스의 실제 로컬 개발 포트인 `http://localhost:4000`을 바라보도록 삼항 연산자 예외 로직 추가.
  * `layout.tsx`: 루트 레이아웃 메타데이터 베이스 설정: 메인 `metadata`에 `metadataBase: new URL(SITE_URL)`을 선언하여 루트에서부터 상대 이미지 경로가 올바른 절대 도메인 경로로 변환되도록 기반 마련.
  * `metadata.ts`: 공용 메타데이터 빌더 갱신: 개별 페이지 및 레이아웃의 메타데이터 생성을 담당하는 `createPageMetadata` 함수의 반환 객체에 `metadataBase: new URL(SITE_URL)` 설정을 주입하여 하위 모든 페이지에서 크롤러 대응 주소가 올바르게 빌드되도록 보장.

---

## 3. 커밋 메시지 본문 가이드

```git
fix(frontend): SNS 공유 이미지 미노출 오류 해결 및 로컬 개발 포트(4000) 바인딩 보강

- site.ts: 환경 변수가 누락된 개발(development) 모드에서 서비스 개발 포트인 http://localhost:4000을 기본값으로 사용하도록 분기 추가.
- layout.tsx: 루트 메타데이터 객체에 metadataBase(SITE_URL) 속성을 추가하여 자동으로 생성되는 OG/Twitter 이미지 URL 경로 맵핑 정상화.
- metadata.ts: 공용 메타데이터 빌더 함수인 createPageMetadata의 반환 데이터에 metadataBase 설정을 통합 주입하여 모든 서브 페이지의 빌드 결과물 경로 보정.
```
