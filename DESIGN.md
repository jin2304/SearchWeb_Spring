# SearchWeb DESIGN SYSTEM

이 문서는 SearchWeb 프로젝트의 시각적 일관성을 유지하고, AI 에이전트가 새로운 UI를 생성할 때 참조하는 디자인 가이드라인입니다.
Apple의 Human Interface Guidelines를 기반으로 light/dark 모드를 모두 지원합니다.

---

## 1. 핵심 정체성 (Core Identity)
SearchWeb은 **"효율적이고 현대적인 링크 관리 플랫폼"**입니다.
- **깔끔함(Minimalism)**: 불필요한 장식을 배제하고 핵심 기능을 강조합니다.
- **전문성(Efficiency)**: 정보의 가독성을 높이고 빠른 탐색을 지원합니다.
- **부드러움(Soft Edges)**: 라운드된 모서리(`rounded-xl`)와 부드러운 호버 효과를 사용합니다.
- **적응형(Adaptive)**: Light/Dark 모드에서 동일한 명도 대비와 가독성을 보장합니다.

## 2. 컬러 팔레트 (Color Palette)
Apple의 다크모드 원칙(semantic color + opacity-based hierarchy)을 따릅니다.

### Light Mode - 핵심 브랜드 컬러
- **Primary (Violet)**: ![](https://placehold.co/15x15/7c3aed/7c3aed.png) `#7c3aed` (Tailwind `violet-600`) - 주요 액션 버튼, 활성화된 상태 강조.
- **Primary-Light**: ![](https://placehold.co/15x15/ede9fe/ede9fe.png) `#ede9fe` (Tailwind `violet-100`) - 버튼 배경, 하이라이트 영역.
- **Primary-Dark**: ![](https://placehold.co/15x15/6d28d9/6d28d9.png) `#6d28d9` (Tailwind `violet-700`) - 클릭 시 상태(Active).

### Dark Mode - 시맨틱 컬러 (보라색 포인트 컬러)
- **Interactive**: ![](https://placehold.co/15x15/7c3aed/7c3aed.png) `#7c3aed` (Violet) - 모든 인터랙티브 요소(버튼, 링크, 활성 상태)만 사용.
- **Interactive-Hover**: ![](https://placehold.co/15x15/8b5cf6/8b5cf6.png) `#8b5cf6` (Bright Violet) - 호버 상태, 강조 필요 시.

### 강조 및 그라디언트 (Accent & Gradients)
- **Light Mode Gradient**: `linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)`
  - 주요 강조 버튼(Save, 가입 등)에 사용합니다.
  - Tailwind 클래스: `bg-linear-to-br from-violet-600 to-purple-500` (또는 커스텀 클래스)
- **Dark Mode**: 단색 보라색(`#7c3aed`)만 사용 (미니멀리즘 유지, 그라디언트 지양) 
- **Dark Mode Hover**: `#8b5cf6` (Bright Violet) 하이라이트.

### Light Mode - 배경 및 표면 (Background & Surface)
- **Background**: ![](https://placehold.co/15x15/f6f6f8/f6f6f8.png) `#f6f6f8` - 전체 페이지 배경.
- **Surface/Card**: ![](https://placehold.co/15x15/ffffff/ffffff.png) `#FFFFFF` (Pure White) - 폴더 카드, 리스트 패널 등 정보가 담기는 영역.
- **Glassmorphism**: `bg-white/50 backdrop-blur-md` - 상단 헤더, 플로팅 메뉴 등에 적용.

### Dark Mode - 배경 및 표면 (Background & Surface)
Apple HIG의 오파시티 기반 계층 시스템 사용:
- **Background (Primary)**: ![](https://placehold.co/15x15/000000/000000.png) `#000000` (Pure Black) - 페이지 전체 배경, 콘텐츠 영역.
- **Surface Level 1**: ![](https://placehold.co/15x15/1c1c1e/1c1c1e.png) `#1c1c1e` (approx) - 카드, 패널 최상위 레이어 (`bg-slate-950` / `bg-neutral-950`).
- **Surface Level 2**: ![](https://placehold.co/15x15/2a2a2d/2a2a2d.png) `#2a2a2d` (approx) - 중첩된 컨테이너, 모달 내부 요소 (`bg-slate-900`).
- **Glassmorphism**: `bg-slate-950/80 backdrop-blur-md` - 헤더, 플로팅 메뉴 (오파시티로 깊이 표현).

### Light Mode - 타이포그래피 컬러 (Typography Colors)
- **Text Main**: ![](https://placehold.co/15x15/121118/121118.png) `#121118` (Near Black) - 제목, 주요 텍스트.
- **Text Sub**: ![](https://placehold.co/15x15/686189/686189.png) `#686189` (Muted Purple/Slate) - 부연 설명, 메타 데이터, 태그 등.
- **Border**: ![](https://placehold.co/15x15/e2e8f0/e2e8f0.png) `rgba(226, 232, 240, 0.6)` (Gray-200/60) - 구분선, 입력창 테두리.

### Dark Mode - 타이포그래피 컬러 (Typography Colors)
Apple HIG 원칙: "단색 흰색 텍스트"로 높은 명도 대비 유지:
- **Text Main**: ![](https://placehold.co/15x15/ffffff/ffffff.png) `#ffffff` (White) - 제목, 주요 텍스트, 모든 활성 컨텐츠.
- **Text Sub**: ![](https://placehold.co/15x15/a0a0a4/a0a0a4.png) `rgba(255, 255, 255, 0.64)` (White 64%) - 부연 설명, 메타 데이터, 태그 등.
- **Text Tertiary**: ![](https://placehold.co/15x15/787880/787880.png) `rgba(255, 255, 255, 0.32)` (White 32%) - 비활성 요소, 플레이스홀더, 약한 힌트.
- **Border**: `rgba(255, 255, 255, 0.08)` (White 8%) - 구분선, 컨테이너 테두리 (오파시티로 깊이 표현).

## 3. 타이포그래피 (Typography)
서비스의 가독성과 정보 밀도를 결정하는 타이포그래피 규칙입니다.

### 기본 폰트
- **Sans-serif**: `Inter`, `sans-serif` (Next.js `next/font/google` 사용)
- **Icon**: `Material Symbols Outlined` (Google Fonts)

### 텍스트 스타일 (Text Styles)
SearchWeb은 높은 정보 밀도를 위해 비교적 작은 크기의 폰트를 정교하게 사용합니다.
- **Title (Large)**: `font-bold`, `text-lg` ~ `text-xl` - 페이지 헤더, 강조 타이틀.
- **Title (Medium)**: `font-semibold`, `text-sm` - 폴더 이름, 다이얼로그 제목.
- **Body / Label**: `font-medium`, `text-[11px]` ~ `text-[13px]` - 일반 텍스트, 메뉴 항목.
- **Caption / Meta**: `text-[10px]`, `text-text-sub` - 태그, 날짜, 보조 정보.

### 아이콘 규칙 (Icon Rules)
- **Default Size**: `18px` ~ `20px` (컨텐츠와 함께 쓰일 때)
- **Small Size**: `14px` ~ `16px` (좁은 버튼이나 리스트 내부)
- **Icon Settings**: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`

## 4. 기본 도형 및 간격 (Shapes & Spacing)
일관된 리듬과 구조를 만드는 시각적 기초 규칙입니다.

### 테두리 곡률 (Border Radius)
SearchWeb은 부드럽고 현대적인 느낌을 위해 라운드 값을 적극적으로 사용합니다.
- **XL (12px / `rounded-xl`)**: 주요 카드(`FolderCard`), 패널 및 모달의 본체.
- **LG (8px / `rounded-lg`)**: 일반 버튼, 큰 입력창, 서브 패널.
- **MD (6px / `rounded-md`)**: 작은 정렬 드롭다운, 태그 필터, 입력창 내부 요소.

### 간격 및 패딩 (Spacing & Padding)
8px(Tailwind 2단위)를 기본 디자인 유닛으로 사용합니다.
- **Inner Spacing**: 요소 내부 간격은 보통 `p-3`(12px) 또는 `p-4`(16px)를 사용합니다.
- **Gap**: 버튼 그룹이나 리스트 간격은 `gap-2`(8px) 또는 `gap-3`(12px)를 선호합니다.
- **Container Path**: 사이드바와 메인 패널 사이의 간격은 `gap-4`(16px).

### 구분선 및 그림자 (Shadows & Borders)
- **Borders**: 강력한 테두리보다는 은은한 `border-gray-200/60`을 사용하여 섹션을 구분합니다.
- **Shadows**: 드롭다운이나 모달의 경우 `shadow-[0_8px_30px_rgb(0,0,0,0.08)]`와 같은 깊이감 있는 섀도우를 사용합니다.

## 5. 컴포넌트 스타일 (Component Styles)
실제 개발 시 적용할 표준 클래스 조합과 코드 패턴입니다.

### Light Mode - 버튼 및 액션 (Buttons & Actions)
- **Primary Button**: `rounded-full` 또는 `rounded-lg` + **Primary Gradient**
  - 스타일: `text-white font-bold shadow-md shadow-violet-500/20 hover:brightness-105 active:scale-95 transition-all`
- **Secondary Button**: `bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg`
- **Ghost Button**: `text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg`

### Dark Mode - 버튼 및 액션 (Buttons & Actions)
보라색(Violet)으로 인터랙티브 요소 통일:
- **Primary Button**: `rounded-lg` + Violet 600
  - 스타일: `bg-violet-600 text-white font-semibold hover:bg-violet-500 active:bg-violet-700 active:scale-95 transition-all`
- **Secondary Button**: `bg-slate-800 text-white hover:bg-slate-700 rounded-lg`
- **Ghost Button**: `text-violet-400 hover:text-violet-300 hover:bg-slate-900/50 rounded-lg`
- **Destructive Button**: `bg-red-600 text-white hover:bg-red-500 rounded-lg` (위험한 액션만 별색 사용)

### Light Mode - 카드 (Cards)
폴더 카드나 개별 링크 항목에 공통으로 적용되는 스타일입니다.
- **Base**: `bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm transition-all`
- **Active/Hover**: `hover:bg-slate-100/80 hover:border-slate-200`
- **Structure**: 아이콘(`material-symbols-outlined`), 타이틀, 그리고 우측 상단의 `more_horiz` 메뉴 버튼.

### Dark Mode - 카드 (Cards)
오파시티 기반 계층화:
- **Base**: `bg-slate-900/50 backdrop-blur-sm border border-white/8 shadow-sm transition-all`
- **Hover**: `hover:bg-slate-800/60 hover:border-white/12`
- **Active**: `bg-slate-800/80 border-violet-500/30` (활성 상태는 보라색 테두리로 표현)
- **Structure**: Light Mode와 동일 구조, 텍스트는 흰색 계열

### Light Mode - 드롭다운 및 메뉴 (Dropdowns & Menus)
- **Container**: `bg-white/95 backdrop-blur-md rounded-xl border border-gray-100/50 shadow-lg`
- **Items**: `flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-colors`
- **Item Hover**: `hover:bg-purple-50 text-gray-700`
- **Destructive Item**: `text-rose-500 hover:bg-rose-50` (삭제 등 위험한 액션)

### Dark Mode - 드롭다운 및 메뉴 (Dropdowns & Menus)
오파시티 기반 설계:
- **Container**: `bg-slate-950/95 backdrop-blur-md rounded-xl border border-white/8 shadow-xl`
- **Items**: `flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium text-white transition-colors`
- **Item Hover**: `hover:bg-violet-600/20 text-white` (보라색 배경으로 호버 표현)
- **Destructive Item**: `text-red-400 hover:bg-red-600/20` (위험한 액션은 빨간색)

### Light Mode - 필터 및 정렬 버튼 (Filter/Sort Triggers)
- **Base**: `group flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200/60 rounded-md bg-white/50 text-[11px] font-medium transition-all`
- **Active State**: `bg-purple-50/50 border-purple-200/50 text-purple-700 shadow-sm`

### Dark Mode - 필터 및 정렬 버튼 (Filter/Sort Triggers)
- **Base**: `group flex items-center gap-1.5 px-2.5 py-1.5 border border-white/8 rounded-md bg-slate-900/50 text-white text-[11px] font-medium transition-all`
- **Active State**: `bg-violet-600/20 border-violet-500/30 text-violet-400 shadow-sm`

### Light Mode - 사이드바 (Sidebar)
- **Left Sidebar**: `w-[280px] border-r border-slate-100 bg-white/40`
- **Tree Item**: `h-10 px-4 flex items-center gap-3 rounded-lg hover:bg-slate-100 transition-colors`

### Dark Mode - 사이드바 (Sidebar)
- **Left Sidebar**: `w-[280px] border-r border-white/8 bg-slate-950/40`
- **Tree Item**: `h-10 px-4 flex items-center gap-3 rounded-lg text-white hover:bg-slate-900/60 transition-colors`
- **Active Item**: `bg-violet-600/20 border-l-2 border-violet-500 text-white`

---
## 작업 규칙 (Maintenance Rules)

### Light/Dark 모드 공통 규칙
1. **임의의 색상 지양**: 반드시 정의된 토큰만 사용합니다.
2. **반응형 고려**: 모바일 대응을 위해 간격과 폰트 크기를 유연하게 조정합니다.
3. **일관성 및 AI 제안**: 모든 UI 기능은 일관된 디자인 시스템을 상속받아 구현합니다. 다만, 특정 상황에서 더 어울리거나 사용자 경험(UX)을 향상시킬 수 있는 대안적인 스타일이나 컬러가 있다고 AI가 판단할 경우, 적극적으로 사용자에게 제안하고 소통합니다.

### Dark Mode 특화 규칙 (SearchWeb Purple 포인트)
4. **시맨틱 색상 엄격성**: Dark Mode에서는 인터랙티브 요소(버튼, 링크, 활성 상태)에만 보라색(`#7c3aed`)을 사용합니다. 장식적 컬러나 배경에 보라색 사용 지양.
5. **오파시티 기반 계층**: 다크 배경에서는 테두리보다 오파시티(`rgba(255,255,255, x%)`)를 우선하여 깊이 표현합니다.
   - Level 1 Surface: `bg-slate-950` (주 컨텐츠)
   - Level 2 Surface: `bg-slate-900` (중첩 요소)
   - 구분선: `border-white/8` ~ `border-white/12`
6. **텍스트 명도 대비**: Dark Mode의 모든 텍스트는 흰색 계열(`#ffffff` 또는 `rgba(255,255,255, x%)`)만 사용하여 WCAG AA 이상의 명도 대비 확보.
7. **그라디언트 지양**: Dark Mode에서는 단색만 사용 (세련된 미니멀리즘 유지).
