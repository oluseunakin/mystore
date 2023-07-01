import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getCategories } from "~/helper";

export const loader = async ({ params }: LoaderArgs) => {
  const count = Number(params.count)
  return json(await getCategories(count));
};