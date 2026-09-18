export const revalidate = 3600; // 1시간 캐싱 — 랜딩 가입자 수 표시용

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  try {
    const res = await fetch(`${apiUrl}/api/service/status`, { next: { revalidate: 3600 } });
    if (!res.ok) return Response.json({ memberCount: 0 }, { status: 200 });
    const json = await res.json();
    return Response.json({ memberCount: json.data?.memberCount ?? 0 });
  } catch {
    return Response.json({ memberCount: 0 }, { status: 200 });
  }
}
