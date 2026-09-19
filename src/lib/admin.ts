export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.isAdmin === true;
  } catch {
    return false;
  }
}