import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { SettingsPage } from "~/Pages/SettingsPage";
import { requireUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Settings" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
