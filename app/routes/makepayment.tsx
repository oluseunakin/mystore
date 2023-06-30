import { redirect, type ActionArgs } from "@remix-run/node";
import { db } from "~/firebase";
import type { OrderedProduct } from "~/helper";
import { getSession } from "~/session";

export const action = async ({request}: ActionArgs) => {
    const cart: OrderedProduct[] = JSON.parse((await request.formData()).get("cart") as string)
    const session = await getSession(request.headers.get("Cookie"));
    if(!session.has("userId")) return redirect("/login")
    const userid = session.get("userId")
    await db.collection("users").doc(userid).update({bought: cart})
    const batch = db.batch()
    cart.forEach(product => {
        batch.update(db.collection("store").doc(product.name), {quantity: product.nq})
    })
    await batch.commit()
    return redirect("/confirmpayment")
}