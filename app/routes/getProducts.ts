import type { ActionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Product} from "~/helper";
import { getTopProducts } from "~/helper";

export const loader = async ({request}: ActionArgs) => {
  const {url, headers} = request
  const uri = new URL(url, headers.get("Host")!)
  const count = Number(uri.searchParams.get('count'))
  return json<Product[]>(await getTopProducts(count));
};
