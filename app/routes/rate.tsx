import type { ActionFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/firebase";

export const action: ActionFunction = async ({request}) => {
    const data = await request.formData()
    const rate = data.get('rate')
    const category = data.get('category') as string
    const name = data.get("name") as string
    await db.collection('store').doc(category).collection('products').doc(name).update({
        rating: rate
    })
    return redirect('/')
}