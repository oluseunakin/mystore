import { useSubmit } from "@remix-run/react";
import { useMemo } from "react";
import type { OrderedProduct } from "~/helper";

export function Cart(props: {
  cart: OrderedProduct[];
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
  setCart: React.Dispatch<React.SetStateAction<OrderedProduct[]>>
}) {
  const { cart, setShowCart, setCart } = props;
  const submit = useSubmit();
  const total = useMemo(() => {
    const totalArray = cart!.map((product) => product.total);
    return totalArray.reduce((prev, current) => prev + current);
  }, [cart]);
  return (
    <div className="cart">
      <h1>Your Shopping Cart Details</h1>
      <div>
        {cart &&
          cart.map((product, i) => (
            <div key={i}>
              <h3>{product.name}</h3>
              <p>{product.quantity}</p>
              <p>{product.price}</p>
              <p>{product.total}</p>
            </div>
          ))}
        <h3>
          <span>Total</span>
          <span>{total}</span>
        </h3>
      </div>
      <div>
        <button
          onClick={() => {
            const fd = new FormData();
            fd.append("cart", JSON.stringify(cart));
            submit(fd, { action: "/makepayment", method: "post" });
            setShowCart(false)
            setCart([])
          }}
        >
          Make Payment
        </button>
      </div>
    </div>
  );
}
