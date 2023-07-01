import { json, type ActionArgs } from "@remix-run/node";
import { getProducts } from "~/helper";

export const loader = async ({ params }: ActionArgs) => {
  const count = Number(params.count);
  return json(await getProducts(count))
};
