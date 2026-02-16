import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { DashboardPage } from "~/Pages/DashboardPage";
import { requireUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Dashboard" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
