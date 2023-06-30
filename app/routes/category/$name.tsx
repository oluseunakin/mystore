import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { ProductComponent } from "~/components/Product";
import { getCategory } from "~/helper";
import styles from "../../styles/category.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ params }: LoaderArgs) => {
  const search = params.name;
  const found = await getCategory(search!);
  return json(found, { status: 200 });
};

export default function Category() {
  const products = useLoaderData<typeof loader>();
  const search = useParams();
  if (products.length == 0)
    return (
      <main>
        <h1>Not Found</h1>
      </main>
    );
  return (
    <main>
      <h1>{search.name}</h1>
      {products.map((p, i) => (
        <ProductComponent product={p} key={i} isStock={true} />
      ))}
    </main>
  );
}
