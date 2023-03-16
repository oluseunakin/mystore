import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import type { ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import { useRef } from "react";
import type { CProduct, Product } from "~/helper";
import { storage } from "~/helper";
import { getAllCategories } from "~/helper";
import { uploadBytes, ref } from "firebase/storage";
import { db } from "~/firebase";
import styles from "~/styles/create.css";

export const links: LinksFunction = () => {
  return [{ href: styles, rel: "stylesheet" }];
};

export const loader = async () => {
  const categories = await getAllCategories();
  return json(categories);
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const products = JSON.parse(data.get("products") as string) as CProduct[];
  const store = db.collection("store");
  const p = products.map(async (p) => {
    await store
      .doc(p.category)
      .collection("products")
      .doc(p.product.name)
      .set(p.product);
  });
  await Promise.all(p);
  return redirect("/admin/productcreated");
};

export default function CreateProduct() {
  const nameRef = useRef<HTMLInputElement>(null);
  let fileRef = useRef<HTMLInputElement>(null);
  const categories = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [selected, setSelected] = useState("");
  const [category, setCategory] = useState("");
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<Product>({
    name: "",
    quantity: 0,
    description: "",
    rating: 0,
    price: 0,
    urls: [],
  });
  const [products, addProduct] = useState<CProduct[]>([]);

  function handleCategory(e: ChangeEvent) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    value === "new" ? setSelected(value) : setCategory(value);
  }

  async function handleAddProduct(e: MouseEvent) {
    e.preventDefault();
    const files = fileRef.current?.files;
    const urls = [];
    if (files) {
      setAdding(true);
      const storRage = storage();
      const category = nameRef.current?.value;
      for (let index = 0; index < files.length; index++) {
        const file = files.item(index) as File;
        const res = await uploadBytes(
          ref(storRage, `${category}/${file?.name}`),
          file
        );
        urls.push(res.metadata.fullPath);
      }
    }
    setProduct({ ...product, urls });
    setAdding(false);
    fileRef && (fileRef.current!.value = "");
  }

  return (
    <div>
      <h1>Create a new Product</h1>
      <div>
        <div>
          <div>
            <label>
              <span>Name </span>
              <input
                ref={nameRef}
                value={product.name}
                onChange={(e) => {
                  setProduct({ ...product, name: e.target.value });
                }}
              />
            </label>
          </div>
          <div>
            <label>
              <span>Description </span>
              <textarea
                value={product.description}
                onChange={(e) => {
                  setProduct({ ...product, description: e.target.value });
                }}
              ></textarea>
            </label>
          </div>
          <div>
            <label>
              <span>Quantity</span>
              <input
                value={product.quantity}
                type="number"
                onChange={(e) => {
                  setProduct({ ...product, quantity: e.target.valueAsNumber });
                }}
              />{" "}
            </label>
          </div>
          <div>
            <label>
              <span>Price </span>
              <input
                value={product.price}
                type="number"
                onChange={(e) => {
                  setProduct({ ...product, price: e.target.valueAsNumber });
                }}
              />{" "}
            </label>
          </div>
          <div>
            <label>
              <span>Category</span>
              <select onChange={handleCategory}>
                <option value="---------">Select Category</option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
                <option value="new">New Category</option>
              </select>
            </label>
          </div>
          {selected === "new" && (
            <div>
              <label>
                <span>Enter New Category</span>
                <input onChange={handleCategory} />
              </label>
            </div>
          )}
          <div>
            <label>
              <span>Pictures</span>
              <input type="file" multiple name="pics" ref={fileRef} />
            </label>
          </div>
          <div className="add">
            <button
              onClick={(e) => handleAddProduct(e)}
              onBlur={(e) => {
                addProduct([
                  ...products,
                  {
                    product,
                    category,
                  },
                ]);
              }}
            >
              {adding ? "Adding Product" : "Add to Stock"}
            </button>
          </div>
          <div className="stock">
            <div>
              {products.map((p, i) => (
                <div key={i}>{p.product.name}</div>
              ))}
            </div>
          </div>
          <div className="create">
            <button
              onClick={(e) => {
                const form = new FormData();
                form.append("products", JSON.stringify(products));
                submit(form, { method: "post" });
              }}
            >
              Create Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
