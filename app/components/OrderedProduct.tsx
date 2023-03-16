import type { OrderedProduct } from "~/helper";

export function OrderedProductComponent(props: {
  product: OrderedProduct;
  removeFromCart: Function;
}) {
  const { product, removeFromCart } = props;
  return (
    <div>
      <div>{product.name}</div>
      <div>{product.quantity}</div>
      <div>{product.price}</div>
      <div>{product.total}</div>
      <div>
        <input
          type="button"
          value="Remove"
          onClick={(e) => {
            removeFromCart((oldCart: OrderedProduct[]) =>
              oldCart.filter((old) => old.name !== product.name)
            );
          }}
        />
      </div>
    </div>
  );
}