import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { OrderedProduct, Product } from "./helper";
import { getTopProducts } from "./helper";
import rootstyle from "./styles/root.css";
//import data from "~/data.json";
import homepic from "./home.svg";

type ContextType = {
  addToCart: Function;
  cart: OrderedProduct[];
  top: {
    product: Product
    category: string;
  }[];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Welcome to my Store",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: rootstyle }];
};

export const loader = async () => {
  const top = (await getTopProducts()) as {
    product: Product;
    category: string;
  }[]; 
  //const top = data;
  return json({ top });
};

export default function App() {
  const [cart, addToCart] = useState<OrderedProduct[]>([]);
  const [all, setAll] = useState<string[]>([]);
  const { top } = useLoaderData<typeof loader>();
  let fetcher = useFetcher();
  const topCategory = top.map((t) => t.category);
  const filteredTopCategorySet = new Set(topCategory);
  const filteredTopCategory = Array.from(filteredTopCategorySet);

  useEffect(() => {
    if (fetcher.type === "done") {
      setAll(fetcher.data.allCategories);
    }
  }, [fetcher, all]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <nav>
          <ul>
            <li>
              <NavLink to="/">
                <img src={homepic} alt="not found" />
              </NavLink>
            </li>
            {filteredTopCategory.map((tc, i) => (
              <li key={i}>
                <Link to={`/category/${tc}`}>{tc}</Link>
              </li>
            ))}
            <li>
              <input
                type="submit"
                value="See All"
                onClick={(e) => {
                  fetcher.load("/category/all");
                }}
              />
            </li>
          </ul>
        </nav>
        <div>
          {all && (
            <div className="all">
              <ul>
                {" "}
                {all.map((category, i) => (
                  <li key={i}>
                    <Link to={`/category/${category}`}>{category}</Link>
                  </li>
                ))}{" "}
              </ul>
            </div>
          )}
          <Outlet context={{ cart, addToCart, top }} />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function useContext() {
  return useOutletContext<ContextType>();
}
