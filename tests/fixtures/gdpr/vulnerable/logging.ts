export function processUser(user: {
  email: string;
  address: string;
}) {
  console.log(user.email);
  console.info(user.address);
}
