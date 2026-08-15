export function processRequest(user: {
  email: string;
  token: string;
}) {
  console.debug(user.email);
  console.log(user.token);
}
