import { ADMIN_ID } from "./account";
import { getUser } from "./session";

/** Claims of the signed-in admin, or null for anyone else. */
export async function getAdmin() {
  const u = await getUser();
  return u && u.uid === ADMIN_ID ? u : null;
}
