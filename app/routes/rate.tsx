import { type ActionFunction } from "@remix-run/node";
import { db } from "~/firebase";
import type { OrderedProduct } from "~/helper";
import { getSession } from "~/session";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const rate = Number(data.get("rate") as string);
  const name = data.get("name") as string;
  const userRef = db.collection("users").doc(userId);
  const productRef = db.collection("store").doc(name);
  const bought = (await userRef.get()).get("bought") as OrderedProduct[];
  const pid = bought.findIndex(b => b.name === name);
  const userProduct = bought[pid];
  userProduct.rating = rate;
  const product = ((await productRef.get()).data())!
  const rating = product.rating + rate
  const raters = product.raters + 1
  await userRef.update({ bought });
  await productRef.update({raters, rating})
  return null;
};
