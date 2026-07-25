# 커밋 계획서 (Commit Plan)

이 문서는 크롬 익스텐션 북마크 저장 기능 구현, 백엔드 인증/보안 고도화, 그리고 폴더/북마크 비즈니스 로직 최적화에 대한 변경 사항을 다루는 커밋 계획서이다. 모든 커밋 메시지와 상세 내용은 백엔드 컨벤션(`docs/Backend/01. backend-convention.md`)의 규칙에 따라 파일명 명시, 상세 설명 유지, 명사형 종결 스타일을 엄격히 적용하여 작성되었다.

이번 브랜치에서 새롭게 추가된 크롬 익스텐션 프로젝트의 뼈대와 빌드 환경을 먼저 커밋한 후, 이를 연동하기 위한 백엔드 인증 및 비즈니스 로직 개선을 순차적으로 커밋하는 흐름으로 설계되었다.

---

## [Commit 1] feat(extension): 크롬 익스텐션 구현 및 자동 빌드 환경 구축

- **커밋 제목**: `feat(extension): 크롬 익스텐션 구현 및 자동 빌드 환경 구축`
- **상세 내용**:
    - `chrome-extension/package.json` & `manifest.json` & manifests: 익스텐션 프로젝트 정의 및 매니페스트 번들링 준비: 크롬 익스텐션의 메타데이터와 패키지 의존성을 정의하고, 브라우저 환경(Chrome, Edge)에 맞춰 빌드 시 dynamic하게 치환될 manifest.base.json 및 개별 타겟 설정 수립.
    - `build-extension.mjs`: 타겟 브라우저별 빌드 스크립트 작성: 배포 환경(production, dev)과 타겟 브라우저(chrome, edge)에 맞춰 manifest 파일을 병합하고 템플릿 환경 변수(`__API_URL__`, `__ENV__`)를 자동으로 주입하는 ES6 기반 빌드 프로세스 수립.
    - `service-worker.js`: 백그라운드 세션 라이프사이클 관리: OAuth 로그인 및 로그아웃 프로세스를 가로채는 리스너를 바인딩하고 토큰을 안전하게 갱신 및 보관하며, 브라우저 컨텍스트 상태 변화에 대응하는 백그라운드 로직 구현.
    - `popup.html` & `popup.js` & `popup.css`: 사용자 중심 팝업 UI 및 테마 설정: 현재 페이지 분석 요청, 추천 카테고리/태그/폴더를 보여주는 직관적인 레이아웃 및 다크모드/시스템 테마와 연동되는 가벼운 CSS 적용. API 서버 수동 설정을 디버그(dev) 시에만 노출하도록 UI 가시성 분기 처리.
    - `options.html` & `options.js` & `options.css`: 익스텐션 관리 옵션 페이지 구현: 확장 프로그램에서 다크 모드, 기본 소셜 로그인 프로바이더, 무음 저장 모드, 서버 주소 설정을 영속 스토리지에 관리할 수 있는 독립 옵션 창 구성.
    - `api.js` & `auth.js` & `browserApi.js` & `storage.js` & `config.js`: 확장프로그램 공유 공통 모듈 설계: 브라우저 격리 스토리지(`chrome.storage.local`) 바인딩, 백엔드 fetch wrapper 구현, 세션 및 일회성 교환 코드를 사용한 토큰 페어 관리 공통 모듈화.
    - `chrome_extension_bookmark_save_plan.md`: 익스텐션 및 북마크 저장 기획 문서 작성: 확장 프로그램에서 북마크를 저장하고 AI 추천 폴더 및 태그를 수신하는 연동 모델의 구현 배경, 인증 아키텍처 및 화면 설계 사양 문서화.

---

## [Commit 2] feat(backend): 크롬 익스텐션 인증 및 CORS 보안 설정 추가

- **커밋 제목**: `feat(backend): 크롬 익스텐션 인증 및 CORS 보안 설정 추가`
- **상세 내용**:
    - `application.properties`: 설정 주입: 크롬/엣지 익스텐션의 리다이렉트 허용 목록과 CORS 허용 오리진을 동적으로 외부 환경 변수(`APP_EXTENSION_ALLOWED_REDIRECT_URIS`, `APP_EXTENSION_ALLOWED_ORIGINS`)를 통해 수신할 수 있도록 프로퍼티 구성.
    - `SecurityConfig.java`: CORS 오리진 동적 확장 및 경로 보안 해제: 환경 변수에서 전달된 익스텐션 오리진 목록을 CORS 허용 대상에 추가하고, 익스텐션 전용 토큰 교환/갱신/로그아웃 API 경로에 대해 permitAll 처리하여 비인증 접근을 보장.
    - `OAuth2SuccessHandler.java`: 익스텐션 로그인 성공 흐름 가로채기: 소셜 로그인 완료 후 리다이렉트 URI가 익스텐션용으로 등록된 도메인인 경우, 세션 토큰을 직접 쿠키에 굽는 대신 일회성 인증 코드를 발행하고 이를 리다이렉트 쿼리 파라미터에 담아 전송하도록 분기 로직 구현.
    - `HttpCookieOAuth2AuthorizationRequestRepository.java`: 잔재 쿠키 삭제 보장: 이전 로그인 과정에서 설정되었던 익스텐션용 redirect_uri 쿠키 잔재가 후속 일반 웹 로그인 요청 시 재사용되어 오동작하지 않도록 초기화 로직 보완.
    - `ExtensionAuthCodeService.java`: 익스텐션 전용 임시 인증 코드 관리: 일회용 인증 코드를 3분의 유효기간(TTL)을 두어 SecureRandom 및 Base64 UrlEncoder 기반으로 안전하게 생성하고 검증 후 즉시 소멸(Consume)시키는 전용 메모리 캐시 및 관리 로직 구축.
    - `AuthService.java`: 익스텐션 세션 보존 토큰 발급 인터페이스 선언: 기존 웹 브라우저의 로그인 상태(RefreshToken)를 강제로 만료(Revoke)시키지 않고, 익스텐션 세션을 위해 독립적으로 동작하는 토큰 쌍을 발급할 수 있도록 `issueTokenPairWithoutRevoking` 명세 선언.
    - `AuthServiceImpl.java`: 익스텐션용 독립 토큰 쌍 발급 구현: 기존 리프레시 토큰의 Grace Period 멱등성을 깨뜨리지 않고, 디바이스 다중 로그인을 지원하기 위해 신규 리프레시 토큰을 안전하게 적재하여 반환하는 로직 구현.
    - `ExtensionAuthController.java`: 익스텐션 전용 인증 API 컨트롤러 구현: 임시 코드를 검증하여 토큰 쌍을 발급하는 `/api/auth/extension/exchange`와 토큰을 갱신하는 `/refresh`, 로그아웃 처리를 담당하는 `/logout` 및 세션 검증용 `/member` 엔드포인트 구현.
    - `AuthRequests.java`: 익스텐션 전용 인증 DTO 작성: 코드 교환을 위한 `ExtensionCodeExchange` 및 토큰 갱신을 위한 `ExtensionRefresh` 이너 클래스 및 필드 제약 조건 정의.

---

## [Commit 3] feat(db): 루트 폴더 대소문자 무시 고유 인덱스 추가 및 DB 스키마 업데이트

- **커밋 제목**: `feat(db): 루트 폴더 대소문자 무시 고유 인덱스 추가 및 DB 스키마 업데이트`
- **상세 내용**:
    - `init_postgres.sql` (local & prod): 루트 폴더명 고유 인덱스 추가: 동일 사용자가 소유한 최상위(루트) 폴더명에 대해 대소문자를 구분하지 않고 중복 생성을 데이터베이스 계층에서 근본적으로 방어하기 위해 `uq_member_folder_root_name_ci` 부분 고유 인덱스(Partial Unique Index) 정의.
    - `docker-compose-prod-db.yml`: 데이터베이스 네트워크 호스트 수정: 프로덕션 배포 서버 환경 이관 작업에 따라 PostgreSQL 포트 바인딩 대상을 `PROD_VM1_INTERNAL_IP`에서 `PROD_VM2_INTERNAL_IP`로 포트 바인딩 가로채기 대상을 수정.
    - `bookmark-mapper.xml`: 중복 북마크 카운트 쿼리 최적화: 특정 회원 ID와 캐노니컬 URL, 그리고 소프트 딜리트(`deleted_at IS NULL`)되지 않은 활성 레코드를 기준으로 중복 개수를 조회하는 `checkBookmarkExistsByUrl` 매퍼 SQL 보완.

---

## [Commit 4] refactor(backend): 신규 폴더 생성과 북마크 저장의 2단계 흐름을 단일 트랜잭션으로 통합

- **커밋 제목**: `refactor(backend): 신규 폴더 생성과 북마크 저장의 2단계 흐름을 단일 트랜잭션으로 통합`
- **상세 내용**:
    - `MemberFolderJpaDao.java`: Advisory Lock 획득 및 무시 쿼리 작성: 동시성 환경에서 동일 이름의 최상위 폴더가 동시에 생성되는 경쟁 상태를 차단하기 위해 PostgreSQL Advisory Lock 기반 락 쿼리 `lockRootFolderNamespace`를 선언하고, 특정 폴더 ID를 제외한 대소문자 무시 중복 체크 쿼리 구현.
    - `MemberFolderService.java`: 멱등 루트 폴더 확보 명세 선언: 대소문자 구분 없이 기존에 존재하는 최상위 폴더가 있으면 재사용하고 없으면 안전하게 자동 생성하여, 중복 호출 시에도 리소스 낭비나 동일 폴더가 여러 개 만들어지는 현상을 원천 방어하는(멱등성 보장) `getOrCreateRootFolderIdIgnoreCase` 메서드 정의.
    - `MemberFolderServiceImpl.java`: 폴더 네임스페이스 격리 및 멱등 로직 구현: 동일 이름의 최상위 폴더 생성 및 이동 요청이 단시간에 다발적으로 인입되어도 DB 정합성이 항상 일정하게 유지되도록 최상위 폴더명에 대한 대소문자 중복 검증 함수 `validateUniqueRootFolderName`을 공통화하고 락을 강제하여 멱등성 확보.
    - `MemberFolderController.java`: 루트 폴더 목록 전용 조회 API 구현: 익스텐션 등에서 사용자의 최상위 폴더 트리 구성을 신속하게 조회하여 보여줄 수 있도록 전용 엔드포인트 `/api/folders/me/root` 신설.
    - `BookmarkFolderTarget.java`: 북마크 대상 폴더 타입 도메인화: 기존 폴더의 사용(`EXISTING`), 부재 시 자동 생성(`CREATE_IF_ABSENT`), 미분류 지정(`UNORGANIZED`)을 도메인 수준에서 유효성 검증과 함께 다룰 수 있도록 팩토리 및 검증 메서드를 담은 Record 타입 구현.
    - `BookmarkService.java` & `BookmarkServiceImpl.java`: 멱등적 통합 저장 구현: AI 추천 폴더가 신규 폴더일 때 클라이언트가 [1단계: 폴더 생성 요청 -> 2단계: 북마크 저장 요청]으로 나누어 처리하던 기존 비동기 시퀀스를 백엔드의 `BookmarkFolderTarget`을 활용해 단 한 번의 요청으로 폴더의 자동 생성과 북마크 매핑을 원자적으로 완결짓도록 변경. 중복 호출 시에도 동일한 폴더가 중복 생성되지 않도록 멱등성 확보 및 일관성 있는 트랜잭션 수립.
    - `BookmarkErrorCode.java`: 요청 예외 코드 정의: 북마크 타겟 폴더 명세가 올바르지 않거나 빈값인 경우를 처리하기 위한 `INVALID_FOLDER_TARGET` ("B004") 예외 코드 선언.
    - `BookmarkRequests.java`: API 명세 재설계 및 밸리데이션 추가: `CreateDto`에서 레거시 필드를 제거하고, 북마크 저장 폴더 방식을 설정하는 중첩 DTO `FolderTargetDto`를 도입하여 `@Valid` 및 `@NotNull` 제약을 통해 비즈니스 커맨드로 안전하게 변환되도록 수정.
    - `BookmarkApiController.java`: DTO 유효성 검증 어노테이션 적용: 입력 파라미터 무결성을 조기에 식별하도록 `CreateDto` 매핑 파라미터에 `@Valid`를 적용하고, `FolderTargetDto`를 `BookmarkFolderTarget` 비즈니스 커맨드로 변환하여 서비스 계층에 넘기도록 갱신.
    - `MyPageController.java`: 레거시 API 사용 중단 처리: 최신 도메인 규칙 및 API 사양(BookmarkFolderTarget 파라미터 추가)으로 리팩토링된 북마크 등록 인터페이스로의 단일화를 위해, 사용되지 않는 구형 마이페이지 내 북마크 삽입 메서드를 주석 처리하여 안전하게 제외.

---

## [Commit 5] refactor(frontend): 북마크 저장 다이얼로그 단일 요청 최적화 및 쿼리 캐시 동기화

- **커밋 제목**: `refactor(frontend): 북마크 저장 다이얼로그 단일 요청 최적화 및 쿼리 캐시 동기화`
- **상세 내용**:
    - `SaveLinkDialog.tsx`: 폴더 자동 생성 및 저장 프로세스 단일화: 기존 2단계(폴더 생성 API 성공 후 북마크 저장 API 순차 실행)의 클라이언트 비동기 체이닝 구조를 제거하고, 백엔드의 `folderTarget` 명세를 활용한 1회의 원자적 뮤테이션 요청으로 최적화하여 화면 지연을 축소하고 불안정한 렌더링 상황 해결.
    - `bookmarkApi.ts`: 저장 성공 후 쿼리 데이터 무효화 확장: 북마크 생성 성공 시 기존 북마크와 태그 목록뿐만 아니라 폴더 목록(`folders`)의 캐시 데이터까지 함께 무효화(`invalidateQueries`) 처리하여 신규 생성된 폴더가 메인 UI 및 셀렉트 박스에 실시간 동기화되도록 보완.
    - `bookmark.ts`: 북마크 생성 요청 타입 수정: API 변경점에 맞춰 `CreateBookmarkRequest` 타입을 리팩토링하여 기존 `memberFolderId`를 제거하고 신규 설계된 유니온 타입 `BookmarkFolderTarget`을 적용.
