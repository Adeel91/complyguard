export async function sendUser(email: string) {
  return fetch("http://example.com/users", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
