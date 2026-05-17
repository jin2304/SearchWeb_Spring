# 📘 Relink 인프라 문서화 가이드 (Success Formula)

이 문서는 Relink 프로젝트의 인프라 아키텍처를 시각적으로 일관되게 기록하기 위한 가이드라인입니다. 나중에 AI에게 작업을 요청하거나 직접 문서를 수정할 때 이 규칙을 따르면 항상 고퀄리티의 결과물을 얻을 수 있습니다.

---

### 🎨 1. 시각적 이미지 생성 (generate_image 전용)

가장 깔끔하고 전문적인 인프라 이미지를 얻기 위한 프롬프트 공식입니다.

**[Standard Prompt]**
> "A professional isometric technical diagram of a web application deployment. Clean white background, muted professional colors (blue, slate, soft green). Inside a box representing 'Oracle Cloud VM', there are two distinct modules: one clearly labeled 'Frontend (Nginx / Next.js)' and another 'Backend (Spring Boot)'. A separate icon for 'PostgreSQL' connected by a line. A Cloudflare logo and a User icon. Premium minimalist design, high resolution, with modern typography. The Nginx and Next.js are grouped together in one clean module to show they work together. 3D isometric style with soft shadows."

**[핵심 규칙]**
*   **배경**: 반드시 `Clean white background` (최고의 가독성)
*   **스타일**: `Isometric 3D`, `Minimalist`, `Premium`
*   **색상**: `Muted professional colors` (채도가 너무 높지 않은 차분한 색상)

---

### 📊 2. 상세 다이어그램 (Mermaid 스타일)

Mermaid 다이어그램의 일관성을 위해 다음 색상 코드를 유지합니다.

**[색상 팔레트]**
*   **Cloudflare**: `#f39c12` (주황색 - 보안 및 외부 서비스)
*   **Frontend**: `#27ae60` (초록색 - 웹 서버 및 정적 자산)
*   **Backend**: `#2980b9` (파란색 - API 및 서버 로직)
*   **Database**: `#8e44ad` (보라색 - 데이터 저장소)
*   **Firewall/Port**: `#e74c3c` (빨간색 - 보안 경계 및 입구)

**[표기 규칙]**
*   한글과 영어를 병기하되, 기술적 용어는 영어를 우선 (예: `Frontend<br/>Next.js / Nginx`)
*   `subgraph`를 활용하여 물리적 서버(VM)와 논리적 스택(Docker)을 구분

---

### 📝 3. 문서 작성 철학 (Content Rules)

1.  **텍스트 최소화**: 서술형 문장보다는 표(Table)와 키워드 위주로 정보 전달.
2.  **계층적 구조**: 
    *   `High-Level` (전체 그림) -> `Detailed Flow` (상세 흐름) -> `Core Roles` (핵심 역할) 순서로 구성.
3.  **Callout 활용**: `[!TIP]`, `[!IMPORTANT]` 등을 사용하여 사용자가 지금 당장 봐야 할 행동(Action Item)을 강조.

---

### 🚀 AI에게 요청하는 마법의 프롬프트

나중에 인프라 변경 시 AI에게 다음과 같이 채팅하세요:

> "기존 `docs/Infrastructure/architecture.md`를 업데이트해줘. 스타일과 색상 코드는 `documentation_guide.md`의 성공 공식을 100% 따르고, 텍스트는 최소화해서 세련되게 만들어줘."

---
