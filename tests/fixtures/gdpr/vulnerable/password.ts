export function authenticate(
  password: string,
  storedPassword: string,
) {
  return password === storedPassword;
}
