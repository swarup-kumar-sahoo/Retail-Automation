import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await API.get("/cart");
    setCart(res.data.items);
    setTotal(res.data.total);
  };

  return (
    <div>
      <h2>Cart</h2>
      {cart.map((item) => (
        <div key={item.product_id}>
          {item.name} x {item.quantity} = ₹{item.price * item.quantity}
        </div>
      ))}
      <h3>Total: ₹{total}</h3>
      <button onClick={() => nav("/payment")}>Proceed to Payment</button>
    </div>
  );
}