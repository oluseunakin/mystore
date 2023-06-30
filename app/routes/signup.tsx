import type { ActionArgs, LinksFunction } from "@remix-run/node";
import { Response, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/firebase";
import crypto from "crypto";
import { getSession, commitSession } from "~/session";
import styles from "../styles/auth.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const name = body.get("name");
  const password = body.get("password") as string;
  const email = body.get("email") as string;
  if (!email.match(/\w+@\w+\..{3}/) || password.length < 8)
    return new Response("Check your input again", { status: 400 });
  const session = await getSession(request.headers.get("Cookie"));
  const hashed = crypto
    .createHash("sha256")
    .update(password)
    .update(email)
    .digest("hex");
  const data = { name, email };
  try {
    await db.collection("users").doc(hashed).create(data);
    session.set("userId", hashed);
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (e) {
    return new Response("User exists", {status: 400})
  }
};

export default function SignUp() {
  const error = useActionData();
  const navigation = useNavigation();

  if (navigation.state === "loading") return <div className="spinner"></div>;

  return (
    <main>
      <h2>Sign up here</h2>
      <Form method="post">
        <input name="name" placeholder="Your Name Here"/>
        <input name="email" placeholder="E-mail address" type="email" />
        <input name="password" placeholder="Password" type="password" />
        {error && <p className="error">{error}</p>}
        <div>
          <button type="submit">Sign Up</button>
        </div>
      </Form>
      <p>
        Already a Member? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}
