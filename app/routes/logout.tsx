import { redirect, type ActionArgs } from "@remix-run/node";
import { commitSession, destroySession, getSession } from "~/session";

export const action = async ({request}: ActionArgs) => {
    const session = await getSession(request.headers.get("Cookie"))
    session.unset("userId")
    destroySession(session)
    return redirect("/login", {headers: {"Set-Cookie": await commitSession(session)}})
}