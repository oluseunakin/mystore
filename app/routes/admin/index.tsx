import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import styles from "~/styles/adminindex.css"

export const links: LinksFunction = () => {
  return [{href: styles, rel: "stylesheet"}]
}

export default function Index() {
  return (
    <div>
      <Link to="createproduct">Create Stock</Link>
    </div>
  );
}
