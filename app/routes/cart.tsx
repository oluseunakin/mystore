import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useMemo, useState } from "react";
import { OrderedProductComponent } from "~/components/OrderedProduct";
import type { OrderedProduct } from "~/helper";
import styles from "~/styles/cart.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const cart = JSON.parse(data.get("cart") as string) as OrderedProduct[];
  return json({ cart });
};

export default function Cart() {
  const data = useActionData<typeof action>();
  const [cart, removeFromCart] = useState(data?.cart);
  const total = useMemo(() => {
    const totalArray = cart!.map((product) => product.total);
    return totalArray.reduce((prev, current) => prev + current);
  }, [cart]);

  return (
    <div className="cart">
      <div>
        <h1 className="order">Your Cart Details</h1>
        {cart!.map((product, i) => (
          <OrderedProductComponent
            product={product}
            key={i}
            removeFromCart={removeFromCart}
          />
        ))}
        <h4 className="order">Total Order is {total}</h4>
      </div>
    </div>
  );
}
