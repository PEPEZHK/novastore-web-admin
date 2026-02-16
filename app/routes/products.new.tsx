import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { ProductFormPage } from "~/Pages/ProductFormPage";
import { requireUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | New Product" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request, { role: "admin" });
  return null;
};

export default function NewProductRoute() {
  return <ProductFormPage mode="create" />;
}
