interface User {
  id: string;
  email: string;
  address: string;
}

export async function sendUser(
  user: User,
) {
  console.log(user.email);
  console.info(user.address);

  return fetch(
    "http://example.com/users",
    {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
      }),
    },
  );
}

export async function deleteUser(
  userId: string,
) {
  return databaseDelete(
    userId,
  );
}

async function databaseDelete(
  userId: string,
) {
  return userId;
}
