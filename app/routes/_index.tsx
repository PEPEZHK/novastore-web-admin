import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return redirect(user ? "/dashboard" : "/login");
};

export default function IndexRedirect() {
  return null;
}
