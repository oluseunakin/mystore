import {
  type LoaderArgs,
  type LinksFunction,
  json,
} from "@remix-run/node";
import styles from "../styles/index.css";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { Product} from "~/helper";
import { getProducts, getTopProducts } from "~/helper";
import { ProductComponent } from "~/components/Product";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const highlight = await getTopProducts(0);
  const firstStock = await getProducts(0);
  return json({ highlight, firstStock});
};

export default function Index() {

  const { highlight, firstStock } = useLoaderData<typeof loader>();
  const [scount, setSCount] = useState(0);
  const [getP, setGetP] = useState(true);
  const [count, setCount] = useState(0);
  const stockFetcher = useFetcher<Product[]>();
  const topFetcher = useFetcher<Product[]>();
  const [topProducts, setTopProducts] = useState<Product[]>(highlight);
  const [stock, setStock] = useState<Product[]>(firstStock);
  const divRef = useRef<HTMLDivElement>(null);
  const [eod, setEOD] = useState(false); //end of data fetch
  const [inPosition, setInPosition] = useState(false);
  function isAtPosition() {
    window.requestAnimationFrame(() => {
      const height = window.innerHeight;
      const threshold = Math.floor(0.7 * height);
      const scrollPosition = Math.floor(document.documentElement.scrollTop);
      const refetch = scrollPosition >= height - threshold;
      if (refetch) {
        setTimeout(() => setInPosition(true), 5000);
      }
    });
  }

  useEffect(() => {
    localStorage.setItem("highlight", JSON.stringify(highlight));
    localStorage.setItem("first", JSON.stringify(firstStock));
  }, [firstStock, highlight]);

  useEffect(() => {
    inPosition && setCount((old) => old + 1);
  }, [inPosition]);

  useEffect(() => {
    count != 0 &&
      !eod &&
      stockFetcher.state === "idle" &&
      stockFetcher.load("/getStock?count=" + count);
  }, [count]);

  useEffect(() => {
    if (stockFetcher.state === "idle" && stockFetcher.data) {
      if (Object.keys(stockFetcher.data).length > 0)
        setStock(stockFetcher.data);
      else {
        setStock(JSON.parse(localStorage.getItem("first")!));
        setEOD(true);
      }
    }
  }, [stockFetcher]);

  useEffect(() => {
    window.addEventListener("scroll", isAtPosition);
  });

  useEffect(() => {
    const bounds = divRef.current?.getBoundingClientRect();
    let timeout: NodeJS.Timeout;
    const viewWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (bounds) {
      const inView =
        (bounds.left >= 0 &&
          bounds.top >= 0 &&
          bounds.bottom <= viewHeight &&
          bounds.right <= viewWidth) ??
        false;
      if (inView) {
        timeout = setTimeout(() => {
          setSCount((old) => old + 1);
        }, 10000);
      }
    }
    return () => {
      clearTimeout(timeout);
    };
  });

  useEffect(() => {
    scount != 0 &&
      getP &&
      topFetcher.state === "idle" &&
      topFetcher.load("/getproducts/" + scount);
  }, [scount]);

  useEffect(() => {
    if (topFetcher.data && topFetcher.state === "idle") {
      const data = topFetcher.data;
      if (Object.keys(data).length > 0) {
        setTopProducts(data);
      } else {
        setGetP(false);
        setTopProducts(JSON.parse(localStorage.getItem("firststock")!));
      }
    }
  }, [topFetcher]);

  return (
    <main>
      {topProducts.length > 0 && (
        <div className="top">
          {topProducts.map((product, i) => (
            <div key={i} ref={divRef}>
              <ProductComponent product={product} />
            </div>
          ))}
        </div>
      )}
      {stock && (
        <div>
          {stock.map((product, i) => (
            <ProductComponent key={i} product={product} isStock={true} />
          ))}
        </div>
      )}
    </main>
  );
}
