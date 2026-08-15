export async function deleteUser(userId: string) {
  await databaseDelete(userId);

  auditLog({
    action: "deleteUser",
    target: userId,
  });
}

async function databaseDelete(userId: string) {
  return userId.length > 0;
}

function auditLog(event: object) {
  return Object.keys(event).length > 0;
}
