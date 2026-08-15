export async function deleteUser(userId: string) {
  await databaseDelete(userId);
}

async function databaseDelete(_userId: string) {
  return true;
}
