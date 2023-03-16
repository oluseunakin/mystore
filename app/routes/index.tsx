import { Form } from "@remix-run/react";
import { ProductComponent } from "~/components/Product";
import type { Product } from "~/helper";
import cartsvg from "~/cart.svg";
import { useContext } from "~/root";

export default function Index() {
  const { top, cart } = useContext();
  const arr: {
    category: string;
    products: Product[];
  }[] = [];

  top.forEach((t, i) => {
    if (i === 0) {
      arr.push({ category: t.category, products: [t.product] });
    } else {
      const old = arr.find((data) => data.category === t.category);
      if (old) old.products.push(t.product);
      else arr.push({ category: t.category, products: [t.product] });
    }
  });

  return (
    <div>
      <main>
        {arr.map((a, i) => (
          <div key={a.category + i}>
            <h1>{a.category}</h1>
            <div className="products">
              {a.products.map((product, i) => (
                <ProductComponent
                  product={product}
                  key={a.category + i}
                  category={a.category}
                />
              ))}
            </div>
          </div>
        ))}
      </main>
      {cart.length > 0 && (
        <Form method="post" action="/cart" className="carts">
          <input name="cart" value={JSON.stringify(cart)} hidden />
          <button>
            <img src={cartsvg} alt="not found" />
          </button>
        </Form>
      )}
    </div>
  );
}
