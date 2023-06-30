import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Product } from "~/helper";
import { getAllCategories, updateProduct } from "~/helper";
import type { ContextType } from "~/root";

export const loader = async () => {
  const categories = await getAllCategories();
  return json(categories);
};

export const action = async ({ request }: ActionArgs) => {
  const products = JSON.parse(
    (await request.formData()).get("products") as string
  ) as Product[];
  products.forEach(async (product, i) => await updateProduct(product));
  return redirect("/admin");
};

export default function EditStock() {
  const categories = useLoaderData<typeof loader>();
  const [editProduct, setEditProduct] = useState<Product>();
  const { user } = useOutletContext<ContextType>();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const [products, setProducts] = useState<Product[]>([]);
  const [toUpdate, addToUpdate] = useState<Product[]>([]);

  useEffect(() => {
    fetcher.state === "idle" && fetcher.data && setProducts(fetcher.data);
  }, [setProducts, fetcher]);
  if (!user)
    return (
      <h1>
        <Link to="/login">You have to login first</Link>
      </h1>
    );
  if (categories.length == 0)
    return (
      <h1>
        <Link to="/createstock">Create your Stock first</Link>
      </h1>
    );
  return (
    <div className="edit">
      <select
        onChange={async (e) => {
          const category = e.target.value;
          category !== "default" &&
            fetcher.load("/api/getcategory/" + category);
        }}
      >
        <option value="default">--------------</option>
        {categories.map((category, i) => (
          <option value={category} key={i}>
            {category}
          </option>
        ))}
      </select>
      {products.length > 0 && (
        <select
          onChange={(e) => {
            const product = JSON.parse(e.target.value);
            product !== "default" && setEditProduct(product);
          }}
        >
          <option value="default">-----------</option>
          {products.map((product, i) => (
            <option key={i} value={JSON.stringify(product)}>
              {product.name}
            </option>
          ))}
        </select>
      )}
      {editProduct && (
        <div>
          <input
            placeholder="Update Quantity"
            type="number"
            value={editProduct.quantity}
            onChange={(e) => {
              setEditProduct({
                ...editProduct,
                quantity: e.target.valueAsNumber,
              });
            }}
          />
          <input
            placeholder="Update Price"
            type="number"
            value={editProduct.price}
            onChange={(e) => {
              setEditProduct({
                ...editProduct,
                price: e.target.valueAsNumber,
              });
            }}
          />
          <div className="add">
            <button
              onClick={(e) => {
                addToUpdate([...toUpdate, editProduct]);
              }}
            >
              Add
            </button>
          </div>
          {toUpdate.length > 0 && (
            <div className="stock">
              {toUpdate.map((t, i) => (
                <div key={i}>
                  <div>{t.name}</div>
                  <div>{t.quantity}</div>
                  <div>{t.price}</div>
                </div>
              ))}
            </div>
          )}
          <div className="update">
            <button
              onClick={() => {
                const fd = new FormData();
                fd.append("products", JSON.stringify(toUpdate));
                submit(fd, { method: "post", action: "/admin/editstock" });
              }}
            >
              Update
            </button>
          </div>
        </div>
      )}
      <Link to="/admin/createstock">Add a new Product to Stock</Link>
    </div>
  );
}
