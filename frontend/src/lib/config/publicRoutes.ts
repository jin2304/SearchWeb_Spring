const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/login",
  "/auth/callback",
]);

const PUBLIC_PATH_PREFIXES: string[] = [];

export function isPublicPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  return (
    PUBLIC_EXACT_PATHS.has(normalized) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  );
}
