import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getAllCategories } from "~/helper";

export const loader = async ({ request }: LoaderArgs) => {
  const allCategories = await getAllCategories();
  return json({ allCategories });
};