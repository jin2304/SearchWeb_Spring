const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/login",
  "/auth/callback",
]);

const PUBLIC_PATH_PREFIXES: string[] = [];

export function isPublicPath(pathname: string) {
  return (
    PUBLIC_EXACT_PATHS.has(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}
