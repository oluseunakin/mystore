import { getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { db } from "./firebase";

export interface Product {
  name: string;
  quantity: number;
  description: string;
  rating: number;
  price: number;
  urls: string[];
}

export interface OrderedProduct {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Category {
  category: string;
  products: Product[]
}

export type CProduct = {
  product: Product;
  category: string
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

export const getTopProducts = async () => {
  const snapshot = await db
    .collectionGroup("products")
    .orderBy("rating")
    .limit(5)
    .get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((doc) => ({
    product: doc.data(),
    category: doc.ref.parent.parent!.id,
  }));
};

export const getProductsWithCategories = async () => {
  const docs = await db.collection("store").listDocuments();
  return await Promise.all(
    docs.map(async (d) => {
      const category = d.id;
      const collection = await d.collection("products").listDocuments();
      const products = transform(collection);
      return { category, products };
    })
  );
};

export const createProduct = async (product: Product, category: string) => {
  return await db.collection(category).add(product);
};

export const getAllCategories = async () => {
  const categories = await db.collection("store").listDocuments();
  if (categories.length === 0) return [];
  return categories.map((c) => c.id);
};

export const transform = async (
  collection: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>[]
) => {
  return await Promise.all(
    collection.map(async (ld) => (await ld.get()).data() as Product)
  );
};
