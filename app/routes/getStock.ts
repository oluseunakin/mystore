import { json, type ActionArgs } from "@remix-run/node";
import { getProducts } from "~/helper";

export const loader = async ({ request }: ActionArgs) => {
  const { url, headers } = request;
  const uri = new URL(url, headers.get("Host")!);
  const count = Number(uri.searchParams.get("count"));
  return json(await getProducts(count))
};
