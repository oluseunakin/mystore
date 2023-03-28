import { useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { OrderedProduct, Product } from "~/helper";
import { storage } from "~/helper";
import starlight from "~/star-light.svg";
import { useContext } from "~/root";
import { ref, getBlob } from "firebase/storage";

export function ProductComponent(props: {
  product: Product;
  category?: string;
}) {
  const submit = useSubmit();
  const { product, category } = props;
  const { addToCart, cart } = useContext();
  const [op, setOP] = useState<OrderedProduct>({
    quantity: product.quantity,
    name: product.name,
    price: product.price,
    total: product.price * product.quantity,
  });
  const [error, setError] = useState("");
  const [addOrRemove, setAddOrRemove] = useState(true);
  const rated = Array(5).fill(false);
  const [urls, setURLS] = useState<any[]>([]);

  useEffect(() => {
    const storRage = storage();
    const urlRefs = product.urls.map((url) => ref(storRage, url));
    const u = urlRefs.map(async (ref) =>
      URL.createObjectURL(await getBlob(ref))
    );
    let images: JSX.Element[] = Array(urls.length);
    const all = Promise.all(u.map(async (url, i) => await url));
    all.then((a) => {
      a.forEach((aa, i) => {
        images[i] = (
          <div key={i}>
            <img src={aa} alt="not found" />
          </div>
        );
      });
      setURLS(images);
    });
  }, [product.urls, product.urls.length, urls.length]);
  return (
    <div className="product">
      <div>
        <div>
          <h3>{product.name}</h3>
        </div>
        <div>{urls}</div>
        <p>{product.description}</p>
        <div>
          {rated.map((r, i) => (
            <button
              className="r"
              key={i}
              onClick={() => {
                const fd = new FormData();
                fd.append("rate", JSON.stringify(++i));
                fd.append("name", product.name);
                category && fd.append("category", category);
                submit(fd, {
                  method: "post",
                  action: "/rate",
                });
              }}
            ></button>
          ))}
        </div>
        <div>
          <div>
            {product.rating}{" "}
            <img className="star" src={starlight} alt="not found" />
          </div>
          <div>{product.quantity}</div>
          <div>{product.price}</div>
        </div>
      </div>
      {addToCart && (
        <div>
          <input
            type="number"
            onChange={(e) => {
              const quant = e.target.valueAsNumber;
              if (quant > product.quantity) {
                setError("You have requested for more than available");
              } else {
                setError("");
                setOP({
                  ...op,
                  quantity: e.target.valueAsNumber,
                  total: e.target.valueAsNumber * product.price,
                });
              }
            }}
          />
          <button
            onClick={() => {
              setError("added");
              setAddOrRemove(!addOrRemove);
              addOrRemove
                ? addToCart([...cart, op])
                : addToCart(() => cart.filter((c) => c.name !== product.name));
            }}
          >{addOrRemove ? "Add to Cart" : "Remove"}</button>
          {error === "You have requested for more than available" && (
            <p style={{ color: "red", fontSize: "small" }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
