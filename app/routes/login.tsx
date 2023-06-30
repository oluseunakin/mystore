import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { Response, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/firebase";
import crypto from "crypto";
import { commitSession, getSession } from "~/session";
import styles from "../styles/auth.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const password = body.get("password") as string;
  const email = body.get("email") as string;
  if (!email.match(/\w+@\w+\..{3}/) || password.length < 8)
    return new Response("Your e-mail or password isn't right", { status: 400 });
  const hash = crypto
    .createHash("sha256")
    .update(password).update(email)
    .digest("hex");
  const foundUser = (await db.collection("users").doc(hash).get()).data();
  if (!foundUser) return redirect("/signup");
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", hash);
  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export default function Login() {
  const error = useActionData();
  const navigation = useNavigation();
  if (navigation.state === "loading") return <div className="spinner"></div>;
  return (
    <main>
      <h2>Login here</h2>
      <Form className="signup" method="post">
        <input name="email" placeholder="E-mail address" type="email" />
        <input name="password" placeholder="Password" type="password" />
        {error && <p className="error">{error}</p>}
        <div>
          <button type="submit">Login</button>
        </div>
      </Form>
      <p>
        <Link to="/signup">Sign up here</Link> instead
      </p>
    </main>
  );
}
