export async function sendUser(email: string) {
  return fetch("https://example.com/users", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
