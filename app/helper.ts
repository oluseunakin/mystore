import { getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { db } from "./firebase";

export type Media = {
  contentType: string;
  url: string;
};

export type Product = {
  name: string;
  quantity: number;
  description: string;
  rating?: number;
  raters?: number;
  reviews?: Review[];
  price: number;
  category: string;
  urls?: Media[];
};

export type User = {
  name: string;
  bought: OrderedProduct[];
};

export interface Review {
  reviewer: string;
  review: string;
}

export type OrderedProduct = {
  name: string;
  quantity: number;
  nq: number;
  price: number;
  total: number;
  rating?: number;
};

export interface Category {
  name: string;
  products?: Product[];
}

export const storage = () => {
  const apps = getApps();
  let app = apps[0];
  if (apps.length == 0) {
    app = initializeApp({
      storageBucket: "onlinestore-5fea6.appspot.com",
    });
  }
  return getStorage(app);
};

export const getProducts = async (count: number) => {
  const take = 10;
  const offset = count * take;
  const c = (await db.collection("store").count().get()).data().count;
  if (offset === c) return [];
  const snapshot = await db
    .collection("store")
    .offset(offset)
    .limit(take)
    .get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((doc) => doc.data() as Product);
};

export const getTopProducts = async (count: number) => {
  const take = 1;
  const offset = count * take;
  const c = (await db.collection("store").count().get()).data().count;
  if (offset === c) return [];
  const snapshot = await db
    .collection("store")
    .orderBy("rating")
    .offset(offset)
    .limit(take)
    .get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((doc) => doc.data() as Product);
};

export const createProduct = async (product: Product) => {
  await db
    .collection("categories")
    .doc(product.category.toUpperCase())
    .collection("products")
    .doc(product.name)
    .set(product);
  await db.collection("bs").add({name: product.name, quantity: product.quantity})
  return await db.collection("store").doc(product.name).set(product);
};

export const updateProduct = async (product: Product) => {
  const { name, quantity, price, category } = product;
  await db
    .collection("categories")
    .doc(category.toUpperCase())
    .collection("products")
    .doc(name)
    .update({ quantity, price });
  await db.collection("store").doc(name).update({ quantity, price });
};

export const getCategories = async (count: number) => {
  const take = 1;
  const offset = take * count;
  const categories = await db.collection("categories").listDocuments();
  const c = categories.length;
  if (offset === c) return [];
  return categories.map((c) => c.id);
};

export const getCategory = async (name: string) => {
  const categoryRef = db
    .collection("categories")
    .doc(name.toUpperCase())
    .collection("products");
  const products = (await categoryRef.limit(10).get()).docs;
  return products.map((p) => p.data() as Product);
};

export const getAllCategories = async () => {
  return (await db.collection("categories").listDocuments()).map((c) => c.id);
};

export const getUser = async (userid: string) => {
  return (await db.collection("users").doc(userid).get()).data() as User;
};

export const transform = async (
  collection: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>[]
) => {
  return await Promise.all(
    collection.map(async (ld) => (await ld.get()).data() as Product)
  );
};

export const getBestSellers = async () => {
  const current = (
    await db.collection("store").select("quantity", "name").get()
  ).docs.map((q) => q.data());
  const past = (await db.collection("bs").get()).docs.map((p) => p.data());
  const sellers = current.map((c, i) => {
    if (c.name === past[i].name) {
      return { name: c.name, quantity: past[i].quantity - c.quantity };
    }
  });
  const filteredSellers = sellers.filter(s => s)
  return filteredSellers.sort((a, b) => a!.quantity - b!.quantity)
};
