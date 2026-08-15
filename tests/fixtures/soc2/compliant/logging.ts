export function processRequest(user: {
  id: string;
  email: string;
}) {
  console.log("Processing request", user.id);
}
