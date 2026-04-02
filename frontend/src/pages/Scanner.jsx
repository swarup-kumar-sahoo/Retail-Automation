import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import API from "../services/api";

export default function Scanner() {

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        await API.post(`/scan/${decodedText}`);
        alert("Product added!");
      }
    );

    return () => scanner.stop();
  }, []);

  return <div id="reader" style={{ width: "300px", margin: "auto" }} />;
}