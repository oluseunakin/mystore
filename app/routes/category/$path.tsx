import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import { useState } from "react";
import { ProductComponent } from "~/components/Product";
import { db } from "~/firebase";
import type { Product } from "~/helper";
import styles from "~/styles/category.css"

export const links: LinksFunction = () => {
    return [{href: styles, rel: "stylesheet"}]
}

export const loader = async ({ params, request }: LoaderArgs) => {
  const { path } = params;
  const url = new URL(request.url);
  const page = url.searchParams ? Number(url.searchParams.get("page")) : 0;
  const collections = db.collection("store").doc(path!).collection("products");
  const count = (await collections.count().get()).data().count;
  const limit = 20;
  const pages = Math.ceil(count / limit);
  const productDocuments = collections
    .limit(limit)
    .offset(limit * page)
    .get();
  const products = (await productDocuments).docs.map((d) =>
    d.data()
  ) as Product[];
  return json({ products, pages });
};

export default function () {
  const { path } = useParams();
  const { products, pages } = useLoaderData<typeof loader>();
  const [p, setP] = useState(Array(pages).fill("okay"));
  return (
    <div>
      <h1>{path}</h1>
      <div className="products">
        {products.map((p, i) => (
          <ProductComponent key={i} product={p} category={path}/>
        ))}
      </div>
      <div>
        {p.length > 1 && p.map((page, i) => (
          <NavLink to={`/category/${path}/?page=${i}`} key={i}>
            {i}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
