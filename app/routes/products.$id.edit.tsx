import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { ProductFormPage } from "~/Pages/ProductFormPage";
import { requireUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Edit Product" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request, { role: "admin" });
  return null;
};

export default function EditProductRoute() {
  const { id } = useParams();
  const parsedId = Number(id);

  return <ProductFormPage mode="edit" productId={parsedId} />;
}
