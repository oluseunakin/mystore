import type { LoaderArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Product} from "~/helper";
import { getTopProducts } from "~/helper";

export const loader = async ({params}: LoaderArgs) => {
  const count = Number(params.count)
  return json<Product[]>(await getTopProducts(count!));
};