import { useEffect, useState } from "react";

function App() {
  const API_URL =
    "https://glowing-carnival-r4vg6jp96xv5c964-5000.app.github.dev/api/products";

  const AUTH_URL =
    "https://glowing-carnival-r4vg6jp96xv5c964-5000.app.github.dev/api/auth";

  const CART_URL =
    "https://glowing-carnival-r4vg6jp96xv5c964-5000.app.github.dev/api/cart";

  // AUTH
  const [isLogin, setIsLogin] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  // PRODUCTS
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // CART
  const [cart, setCart] = useState(null);

  // REGISTER / LOGIN
  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/login" : "/register";

      const body = isLogin
        ? {
            email: authEmail,
            password: authPassword,
          }
        : {
            name: authName,
            email: authEmail,
            password: authPassword,
          };

      const response = await fetch(`${AUTH_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        alert("Login successful");
      } else {
        alert("Registration successful. Now login.");
        setIsLogin(true);
      }

      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setProducts([]);
    setCart(null);
  };

  // GET PRODUCTS
  useEffect(() => {
    if (!token) return;

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
  }, [token]);

  // GET CART
  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
      try {
        const response = await fetch(CART_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Cart error:", error);
      }
    };

    fetchCart();
  }, [token]);

  // ADD / UPDATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      price,
      category,
      stock,
    };

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (editingId) {
        setProducts(
          products.map((product) =>
            product._id === editingId ? data : product
          )
        );
      } else {
        setProducts([...products, data]);
      }

      setName("");
      setPrice("");
      setCategory("");
      setStock("");
      setEditingId(null);
    } catch (error) {
      console.error("Product error:", error);
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setEditingId(product._id);
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(
        products.filter((product) => product._id !== id)
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ADD TO CART
  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(CART_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      setCart(data);
      alert("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // UPDATE CART QUANTITY
  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      const response = await fetch(
        `${CART_URL}/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCart(data);
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  // REMOVE FROM CART
  const handleRemoveFromCart = async (productId) => {
    try {
      const response = await fetch(
        `${CART_URL}/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCart(data);
    } catch (error) {
      console.error("Remove cart error:", error);
    }
  };

  // LOGIN / REGISTER SCREEN
  if (!token) {
    return (
      <div>
        <h1>{isLogin ? "Login" : "Register"}</h1>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(e) =>
              setAuthPassword(e.target.value)
            }
          />

          <button type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Create an account"
            : "Already have an account? Login"}
        </button>
      </div>
    );
  }

  // LOGGED-IN SCREEN
  return (
    <div>
      <h1>Grocery Products</h1>

      <button onClick={handleLogout}>Logout</button>

      {/* PRODUCT FORM */}
      <h2>
        {editingId ? "Edit Product" : "Add Product"}
      </h2>

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

      {/* PRODUCTS */}
      <h2>Products</h2>

      {products.map((product) => (
        <div key={product._id}>
          <p>
            <strong>{product.name}</strong> | ₹
            {product.price} | {product.category} | Stock:{" "}
            {product.stock}
          </p>

          <button onClick={() => handleEdit(product)}>
            Edit
          </button>

          <button
            onClick={() => handleDelete(product._id)}
          >
            Delete
          </button>

          <button
            onClick={() => handleAddToCart(product._id)}
          >
            Add to Cart
          </button>
        </div>
      ))}

      {/* CART */}
      <h2>Cart</h2>

      {cart && cart.items.length === 0 && (
        <p>Cart is empty</p>
      )}

      {cart &&
        cart.items.map((item) => (
          <div key={item.product._id}>
            <p>
              {item.product.name} - ₹{item.product.price}
            </p>

            <button
              onClick={() =>
                handleUpdateQuantity(
                  item.product._id,
                  item.quantity - 1
                )
              }
            >
              -
            </button>

            <span> {item.quantity} </span>

            <button
              onClick={() =>
                handleUpdateQuantity(
                  item.product._id,
                  item.quantity + 1
                )
              }
            >
              +
            </button>

            <button
              onClick={() =>
                handleRemoveFromCart(item.product._id)
              }
            >
              Remove
            </button>
          </div>
        ))}

      {/* CART TOTAL */}
      {cart && cart.items.length > 0 && (
        <h3>
          Total: ₹
          {cart.items.reduce(
            (total, item) =>
              total +
              item.product.price * item.quantity,
            0
          )}
        </h3>
      )}
    </div>
  );
}

export default App;