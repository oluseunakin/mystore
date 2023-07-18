//import { cssBundleHref } from "@remix-run/css-bundle";
import type { LoaderArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import rootStyle from "./styles/root.css";
import { useEffect, useRef, useState } from "react";
import type { User, OrderedProduct } from "./helper";
import { getCategories, getUser } from "./helper";
import { Cart } from "./components/Cart";
import { getSession } from "./session";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: rootStyle },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  },
];

export type ContextType = {
  cart: OrderedProduct[];
  setCart: React.Dispatch<React.SetStateAction<OrderedProduct[]>>;
  user: User;
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  let user: User | undefined;
  if (session && session.has("userId")) {
    user = await getUser(session.get("userId"));
  }
  const firstCategories = await getCategories(0);
  return json({ firstCategories, user });
};

export default function App() {
  const { firstCategories, user } = useLoaderData<typeof loader>();
  const [cart, setCart] = useState<OrderedProduct[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [getC, setGetC] = useState(true);
  const [search, setSearch] = useState("");
  const submit = useSubmit();
  const categoryFetcher = useFetcher();
  const [categories, setCategories] = useState<string[]>(firstCategories);
  const [count, setCount] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    count == 0 &&
      localStorage.setItem("firstcat", JSON.stringify(firstCategories));
  }, [count, firstCategories]);

  useEffect(() => {
    count != 0 &&
      getC &&
      categoryFetcher.state === "idle" &&
      categoryFetcher.load("/getcategories/" + count);
  }, [count, getC]);

  useEffect(() => {
    if (categoryFetcher.data && categoryFetcher.state === "idle") {
      const data = categoryFetcher.data;
      if (Object.keys(data).length > 0) {
        setCategories(data);
      } else {
        setGetC(false);
        setCategories(JSON.parse(localStorage.getItem("firstcat")!));
      }
    }
  }, [categoryFetcher]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const bounds = categoriesRef.current?.getBoundingClientRect();
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
      if (inView && getC) {
        timeout = setTimeout(() => {
          setCount((old) => old + 1);
        }, 10000);
      }
    }
    return () => {
      clearInterval(timeout);
    };
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <h1>
            <Link to="/">Welcome to our Store</Link>
          </h1>
          <button className="menubutton" onClick={() => {
            const categories = categoriesRef.current!
            if(categories.classList.contains("hide")) categories.classList.replace("hide", "showmenu")
            else if(categories.classList.contains("showmenu")) categories.classList.replace("showmenu", "hide")
            else categories.classList.add("showmenu")
         }}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>
        <nav>
          <div>
            <div>
              <input
                type="search"
                placeholder="Search"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              <button
                onClick={() => {
                  submit(null, { action: "/category/" + search });
                }}
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
            {user ? (
              <div className="userinfo">
                <button
                  onClick={() => {
                    cart.length > 0 && setShowCart(true);
                  }}
                >
                  <span className="material-symbols-outlined">
                    shopping_cart
                  </span>
                  {cart && cart.length > 0 ? <sup>{cart.length}</sup> : null}
                </button>
                <button>
                  <span className="material-symbols-outlined">
                    manage_accounts
                  </span>
                </button>
                <button
                  onClick={() => {
                    submit(null, { method: "post", action: "/logout" });
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <div className="guest">
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign up</Link>
              </div>
            )}
          </div>
          {categories.length > 0 && (
            <div ref={categoriesRef} className="categories hide">
              {categories.map((c, i) => (
                <div key={i}>
                  <Link
                    to={(() => `/category/${c}`)()}
                    onClick={() => {
                      const classList = categoriesRef.current!.classList;
                      if (classList.contains("hide")) classList.remove("hide");
                      else classList.add("hide");
                    }}
                  >
                    {c}
                  </Link>
                </div>
              ))}
              <div>
                <Link to="/category/all">See All</Link>
              </div>
            </div>
          )}
        </nav>
        {showCart ? (
          <div className="ct">
            <button
              className="back"
              onClick={() => {
                setShowCart(false);
              }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <Cart cart={cart} setShowCart={setShowCart} setCart={setCart} />
          </div>
        ) : (
          <Outlet context={{ cart, setCart, user }} />
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
