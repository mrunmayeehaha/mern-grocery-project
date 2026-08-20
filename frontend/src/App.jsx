import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  const product = {
    name,
    price,
    category,
    quantity,
  };

  console.log("Sending:", product);

  try {
    const response = await fetch(
      "https://glowing-carnival-r4vg6jp96xv5c964-5000.app.github.dev/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      }
    );

    console.log("Status:", response.status);

    const data = await response.json();

    console.log("Response:", data);

    if (response.ok) {
      alert("Product added!");
    } else {
      alert("Failed to add product");
    }
  } catch (error) {
    console.log("Error:", error);
  }
};
  return (
    <div>
      <h1>Grocery Store</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default App;