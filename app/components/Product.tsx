import { useOutletContext } from "@remix-run/react";
import { memo, useMemo, useRef, useState } from "react";
import type { Product } from "~/helper";
import type { ContextType } from "~/root";
import { MediaComponent } from "./Media";

export const ProductComponent = memo(function PC(props: {
  product: Product;
  isStock?: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const { cart, setCart, user } = useOutletContext<ContextType>();
  const { product, isStock } = props;
  const cartIndex = useMemo(() => {
    return cart.findIndex((op, i) => op.name === product.name);
  }, [cart, product]);

  const op = cart[cartIndex];
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");
  const hasBoughtItemIndex = useMemo(
    () =>
      user
        ? user.bought
          ? user.bought.findIndex((bp) => bp.name === product.name)
          : -1
        : -1,
    [user, product]
  );
  const [rating, setRating] = useState<boolean[]>(() => {
    if (hasBoughtItemIndex == -1) return [];
    const rated = user.bought[hasBoughtItemIndex].rating;
    if (rated && rated > 0)
      return Array(5)
        .fill(false)
        .map((r, i) => i < rated);
    return Array(5).fill(false);
  });
  return (
    <div className="product" ref={divRef}>
      <h2>{product.name}</h2>
      <h3>{product.description}</h3>
      {product.urls!.length > 0 && (
        <MediaComponent sources={product.urls!} />
      )}
      {hasBoughtItemIndex != -1 && (
        <div className="ratings">
          {rating.map((r, i) => (
            <button
              className="r"
              key={i}
              onClick={() => {
                const fd = new FormData();
                setRating((rating) => rating.map((r, j) => j <= i));
                fd.append("rate", JSON.stringify(++i));
                fd.append("pid", product.name);
                fd.append("name", product.name);
                fetch("/rate", { method: "post", body: fd });
              }}
            >
              <span
                className={(() =>
                  r
                    ? "material-symbols-outlined full"
                    : "material-symbols-outlined")()}
              >
                star_rate
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="info">
        <div>
          <span>{product.raters != 0 ? Math.round(product.rating! / product.raters!): 0}</span>
          <span className="material-symbols-outlined">star</span>
        </div>
        <div>{product.quantity}</div>
        <div>{product.price}</div>
      </div>
      {isStock && (
        <div>
          <div>
            <input
              type="number"
              placeholder="Enter quantity"
              onChange={(e) => {
                error && setError("");
                if (e.target.valueAsNumber > product.quantity) {
                  setError("We do not have up to that in stock");
                } else setQuantity(e.target.valueAsNumber);
              }}
            />
          </div>
          <div>
            {cartIndex != -1 && (
              <button
                onClick={() => {
                  setError("");
                  if (quantity > op!.quantity)
                    setError("Press the + button to increase your quantity");
                  else if (quantity == op!.quantity) {
                    cart.splice(cartIndex, 1);
                    setCart([...cart]);
                  } else {
                    op!.quantity -= quantity;
                    op.nq = product.quantity - op.quantity;
                    op!.total = op!.price * op!.quantity;
                    setCart([...cart]);
                  }
                }}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            )}
            <button
              onClick={(e) => {
                setError("");
                if (cartIndex != -1) {
                  op!.quantity += quantity;
                  op.nq = product.quantity - op.quantity;
                  if (op!.quantity > product.quantity) {
                    setError("We do not have up to that in stock");
                    op!.quantity -= quantity;
                  } else {
                    op!.total = op!.price * op!.quantity;
                    setCart([...cart]);
                  }
                } else
                  setCart([
                    ...cart,
                    {
                      name: product.name,
                      price: product.price,
                      quantity,
                      nq: product.quantity - quantity,
                      total: quantity * product.price,
                    },
                  ]);
              }}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {cartIndex != -1 && op && (
        <div className="pcart">
          <h5>{op!.name}</h5>
          <p>{op?.quantity}</p>
        </div>
      )}
    </div>
  );
});
