import { useState } from "react";

export default function Payment() {
  const [method, setMethod] = useState("card");

  return (
    <div>
      <h2>Payment</h2>

      <select onChange={(e)=>setMethod(e.target.value)}>
        <option value="card">Card</option>
        <option value="phonepay">PhonePe</option>
      </select>

      {method === "card" && (
        <input placeholder="Enter Card Number" />
      )}

      {method === "phonepay" && (
        <input placeholder="Enter Phone Number" />
      )}

      <button>Pay Now</button>
    </div>
  );
}