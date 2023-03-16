import type { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import styles from "~/styles/admin.css"

export const links: LinksFunction = () => {
  return [{href: styles, rel: "stylesheet"}]
}

export default function Admin() {
  return (
    <div>
      <h1>Welcome to your Admin Dashboard</h1>
      <Outlet></Outlet>
    </div>
  );
}
