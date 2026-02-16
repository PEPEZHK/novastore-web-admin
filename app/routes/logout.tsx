import type {
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { logout } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Logout" }];
};

export const loader = async () => {
  throw new Response("Method Not Allowed", { status: 405 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return logout(request);
};

export default function LogoutRoute() {
  return null;
}
