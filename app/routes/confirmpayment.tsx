import { Link } from "@remix-run/react";

export default function ConfirmPayment() {
  return (
    <main>
      <h1>Thanks for shopping with us</h1>
      <h3>
        <Link to="/">Shop More</Link>
      </h3>
    </main>
  );
}
