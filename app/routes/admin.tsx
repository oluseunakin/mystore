import type { LinksFunction } from "@remix-run/node";
import { Link, Outlet, useOutletContext } from "@remix-run/react";
import styles from "~/styles/admin.css"

export const links: LinksFunction = () => {
  return [{href: styles, rel: "stylesheet"}]
}

export default function Admin() {
  
  return (
    <main>
      <h1>Welcome to your Admin Dashboard</h1>
      <div>
        <Link to="createstock">Create Stock</Link>
        <Link to="editstock">Update Stock</Link>
      </div>
      <Outlet context={useOutletContext()}></Outlet>
    </main>
  );
}
