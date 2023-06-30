import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBestSellers } from "~/helper";

export const loader = async () => {
  const best = await getBestSellers()
  return json(best) 
}

export default function Index() {
  const best = useLoaderData<typeof loader>()
  return (
    <div>
      <h3>Your best sellers</h3>
      {best.length > 0 && <div>{
        best.map((b, i) => <div key={i}>{b?.name} {b?.quantity}</div>)}</div>}
    </div>
  );
}
