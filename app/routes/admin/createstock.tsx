import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import type { ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import { useRef } from "react";
import type { Product } from "~/helper";
import { createProduct, getCategories } from "~/helper";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import styles from "~/styles/admin.css";
import { storage } from "~/helper";
import { ContextType } from "~/root";

export const links: LinksFunction = () => {
  return [{ href: styles, rel: "stylesheet" }];
};

export const loader = async () => {
  const categories = await getCategories(0);
  return json(categories);
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const products = JSON.parse(data.get("products") as string) as Product[];
  products.forEach(async (product) => {
    await createProduct(product);
  });
  return redirect("/admin/productcreated");
};

export default function CreateProduct() {
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [selected, setSelected] = useState("");
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<Product>();
  const [products, addProduct] = useState<Product[]>([]);
  const { user } = useOutletContext<ContextType>();

  if (adding) {
    addProduct([...products, product!]);
    setAdding(false);
  }

  function handleCategory(e: ChangeEvent) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    value === "new"
      ? setSelected(value)
      : setProduct({ ...product!, category: value });
  }

  async function handleAddProduct(e: MouseEvent) {
    const files = fileRef.current?.files;
    const urls = [];
    if (files) {
      const storRage = storage();
      const category = nameRef.current?.value;
      for (let index = 0; index < files.length; index++) {
        const file = files.item(index) as File;
        const res = await uploadBytes(
          ref(storRage, `${category}/${file?.name}`),
          file
        );
        const url = await getDownloadURL(ref(storRage, res.metadata.fullPath));
        urls.push({ url, contentType: res.metadata.contentType! });
      }
      fileRef.current!.value = "";
    }
    setAdding(true);
    setProduct({ ...product!, urls });
  }

  if (!user)
    return (
      <h1>
        <Link to="/login">You have to login first</Link>
      </h1>
    );

  return (
    <div className="cp">
      <h2>Create a new Product</h2>
      <input
        ref={nameRef}
        placeholder="Product Name"
        onChange={(e) => {
          setProduct({
            ...product!,
            name: e.target.value,
            raters: 0,
            rating: 0,
          });
        }}
      />
      <textarea
        placeholder="Product Description"
        onChange={(e) => {
          setProduct({ ...product!, description: e.target.value });
        }}
      ></textarea>
      <input
        type="number"
        placeholder="Quantity"
        onChange={(e) => {
          setProduct({ ...product!, quantity: e.target.valueAsNumber });
        }}
      />
      <input
        type="number"
        placeholder="Price"
        onChange={(e) => {
          setProduct({ ...product!, price: e.target.valueAsNumber });
        }}
      />
      <select onChange={handleCategory}>
        <option value="---------">Select Category</option>
        {categories!.map((c, i) => (
          <option key={i} value={c}>
            {c}
          </option>
        ))}
        <option value="new">New Category</option>
      </select>
      {selected === "new" && (
        <input onChange={handleCategory} placeholder="Enter a new category" />
      )}
      <div className="media">
        <span>Media</span>
        <input type="file" multiple name="pics" ref={fileRef} />
      </div>
      <div className="add">
        <button onClick={(e) => handleAddProduct(e)}>
          {adding ? "Adding Product" : "Add to Stock"}
        </button>
      </div>
      {products.length > 0 && <div className="stock">
        <div>
          {products.map((p, i) => (
            <div key={i}>{p.name}</div>
          ))}
        </div>
      </div>}
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
  );
}
