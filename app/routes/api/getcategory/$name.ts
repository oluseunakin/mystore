import { json, type LoaderArgs } from "@remix-run/node";
import { getCategory } from "~/helper";

export const loader = async ({params}: LoaderArgs) => {
    const categoryName = params.name as string
    const products = await getCategory(categoryName)
    return json(products)
}