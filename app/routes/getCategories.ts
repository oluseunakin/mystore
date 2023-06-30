import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getCategories } from "~/helper";

export const loader = async ({ request }: LoaderArgs) => {
  const {url, headers} = request
  const uri = new URL(url, headers.get("Host")!)
  const count = Number(uri.searchParams.get('count'))
  return json(await getCategories(count));
};