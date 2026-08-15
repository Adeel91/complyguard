export async function deleteUser(userId: string) {
  await databaseDelete(userId);

  auditLog({
    action: "deleteUser",
    target: userId,
  });
}

async function databaseDelete(_userId: string) {
  return true;
}

function auditLog(_event: object) {
  return true;
}
