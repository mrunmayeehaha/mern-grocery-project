import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const API_URL =
    "https://glowing-carnival-r4vg6jp96xv5c964-5000.app.github.dev/api/products";

  // GET products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchProducts();
  }, []);

  // ADD / UPDATE product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      price,
      category,
      stock,
    };

    console.log("Sending:", productData);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      console.log("Status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (editingId) {
        // Update product in list
        setProducts(
          products.map((product) =>
            product._id === editingId ? data : product
          )
        );
      } else {
        // Add new product to list
        setProducts([...products, data]);
      }

      // Clear form
      setName("");
      setPrice("");
      setCategory("");
      setStock("");
      setEditingId(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // EDIT product
  const handleEdit = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setEditingId(product._id);
  };

  // DELETE product
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h1>Grocery Products</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
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
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <button type="submit">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2>Products</h2>

      {products.map((product) => (
        <div key={product._id}>
          <p>
            <strong>{product.name}</strong> | ₹{product.price} |{" "}
            {product.category} | Stock: {product.stock}
          </p>

          <button onClick={() => handleEdit(product)}>
            Edit
          </button>

          <button onClick={() => handleDelete(product._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;