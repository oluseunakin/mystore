import { type LinksFunction, json } from "@remix-run/node";
import styles from "../styles/index.css";
import { useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "~/helper";
import { getProducts, getTopProducts } from "~/helper";
import { ProductComponent } from "~/components/Product";
import TopProduct from "~/components/TopProduct";
import { MediaComponent } from "../components/Media";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async () => {
  const firstStock = await getProducts(0);
  const highlight = await getTopProducts(0);
  return json({ firstStock, highlight });
};

export default function Index() {
  const navigation = useNavigation();
  const { firstStock, highlight } = useLoaderData<typeof loader>();
  const [count, setCount] = useState(0);
  const stockFetcher = useFetcher<Product[]>();
  const [stock, setStock] = useState<Product[]>(firstStock);
  const [eod, setEOD] = useState(false); //end of data fetch
  const [inPosition, setInPosition] = useState(false);
  const [topProducts, setTopProducts] = useState<Product[]>(highlight);
  const [getP, setGetP] = useState(true);
  const [scount, setSCount] = useState(0);
  const topFetcher = useFetcher<Product[]>();
  const divRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [divWidth, setDivWidth] = useState(-1)

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
    if (mediaRef.current) setDivWidth(mediaRef.current.clientWidth / 2);
  }, [mediaRef.current]);

  useEffect(() => {
    localStorage.setItem("first", JSON.stringify(firstStock));
    scount && localStorage.setItem("highlight", JSON.stringify(highlight));
  }, [firstStock, scount, highlight]);

  useEffect(() => {
    inPosition && setCount((old) => old + 1);
  }, [inPosition]);

  useEffect(() => {
    count != 0 &&
      !eod &&
      stockFetcher.state === "idle" &&
      stockFetcher.load("/getstock/" + count);
  }, [count, eod]);

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
        }, 20000);
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
  }, [scount, getP]);

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

  useEffect(() => {
    window.addEventListener("scroll", isAtPosition);
  });

  if (navigation.state === "loading") return <div className="spinner"></div>;

  return (
    <main>
      {topProducts.length > 0 && (
        <div className="top" ref={divRef}>
          {topProducts.map((product, i) => (
            <div key={i} ref={mediaRef}>
              {divWidth != -1 && (
                <TopProduct
                  message="Hey, grab this awoof"
                  media={
                    <MediaComponent
                      sources={product.urls!}
                      divWidth={divWidth}
                    />
                  }
                />
              )}
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
