import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useParams, useRouteLoaderData } from "@remix-run/react";
import { ProductViewPage } from "~/Pages/ProductViewPage";
import type { loader as rootLoader } from "~/root";
import { requireUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Product Details" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function ProductDetailsRoute() {
  const { id } = useParams();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const parsedId = Number(id);
  const canManage = rootData?.user?.role === "admin";

  return <ProductViewPage productId={parsedId} canManage={canManage} />;
}

