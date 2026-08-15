export async function deleteUser(userId: string) {
  await databaseDelete(userId);
}

async function databaseDelete(userId: string) {
  return userId.length > 0;
}
