import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "ReLink AI 북마크 관리 서비스";
export const dynamic = "force-static";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// 로컬 시스템에서 사용 가능한 폰트 바이너리를 확보합니다. (네트워크 fetch 우회 및 오프라인 빌드 대비)
function getLocalFontBuffer(): ArrayBuffer {
  const paths = [
    "C:\\Windows\\Fonts\\malgun.ttf",                                      // Windows 맑은 고딕
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",                          // macOS 애플 산돌고딕
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",                     // Linux 나눔고딕
    "/usr/share/fonts/nanumfont/NanumGothic.ttf"                           // Linux 나눔고딕 alternative
  ];

  for (const fontPath of paths) {
    try {
      if (fs.existsSync(fontPath)) {
        const buffer = fs.readFileSync(fontPath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      }
    } catch (e) {
      // Ignored
    }
  }
  
  // 폰트를 전혀 찾지 못한 경우 빈 ArrayBuffer 리턴 (빌드 에러 방지)
  return new ArrayBuffer(0);
}

export default function OpenGraphImage() {
  // 로컬 로고 이미지를 Base64 데이터로 읽어들임
  const logoPath = path.join(process.cwd(), "public", "relink_logo.png");
  const logoData = fs.readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  // 오프라인 빌드 친화적인 시스템 폰트 데이터 로드
  const fontData = getLocalFontBuffer();

  const fontConfig = fontData.byteLength > 0 ? [
    {
      name: "LocalFont",
      data: fontData,
      style: "normal" as const,
      weight: 700 as const,
    }
  ] : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#ffffff",
          padding: "72px 84px",
          fontFamily: fontData.byteLength > 0 ? 'LocalFont, Arial, sans-serif' : 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "720px",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 700,
              color: "#a78bfa",
            }}
          >
            ReLink
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "58px",
              lineHeight: 1.25,
              fontWeight: 800,
              letterSpacing: "-1.5px",
            }}
          >
            <span>흩어진 링크를 한곳에,</span>
            <span>AI 링크 관리 서비스 ReLink</span>
          </div>
        </div>
        <img
          src={logoBase64}
          alt="ReLink Logo"
          style={{
            width: "260px",
            height: "260px",
            objectFit: "cover",
            borderRadius: "56px",
            boxShadow: "0 30px 80px rgba(124, 58, 237, 0.45)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: fontConfig,
    }
  );
}
