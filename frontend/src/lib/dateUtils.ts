/**
 * 날짜 문자열이 '오늘'인지 확인하는 헬퍼 함수
 */
export function isCreatedToday(createdAtStr: string): boolean {
  if (!createdAtStr) return false;
  const createdDate = new Date(createdAtStr);
  const today = new Date();
  return (
    createdDate.getFullYear() === today.getFullYear() &&
    createdDate.getMonth() === today.getMonth() &&
    createdDate.getDate() === today.getDate()
  );
}
