import { useEffect, useState } from "react";

function App() {
  const BASE_URL =
    "https://mern-grocery-project.onrender.com";

  const API_URL = `${BASE_URL}/api/products`;
  const AUTH_URL = `${BASE_URL}/api/auth`;
  const CART_URL = `${BASE_URL}/api/cart`;
  const ORDER_URL = `${BASE_URL}/api/orders`;

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

  // ORDERS
  const [orders, setOrders] = useState([]);

  // =========================
  // AUTH
  // =========================

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setProducts([]);
    setCart(null);
    setOrders([]);
  };

  // =========================
  // GET PRODUCTS
  // =========================

  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Products error:", error);
      }
    };

    fetchProducts();
  }, [token]);

  // =========================
  // GET CART
  // =========================

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

  // =========================
  // GET ORDERS
  // =========================

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(ORDER_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setOrders(data);
      } catch (error) {
        console.error("Orders error:", error);
      }
    };

    fetchOrders();
  }, [token]);

  // =========================
  // ADD / UPDATE PRODUCT
  // =========================

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
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
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
      alert(error.message);
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const handleEdit = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setEditingId(product._id);
  };

  // =========================
  // DELETE PRODUCT
  // =========================

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
      alert(error.message);
    }
  };

  // =========================
  // ADD TO CART
  // =========================

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
        throw new Error(
          data.message || "Failed to add to cart"
        );
      }

      setCart(data);
      alert("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.message);
    }
  };

  // =========================
  // UPDATE CART QUANTITY
  // =========================

  const handleUpdateQuantity = async (
    productId,
    quantity
  ) => {
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
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCart(data);
    } catch (error) {
      console.error("Update cart error:", error);
      alert(error.message);
    }
  };

  // =========================
  // REMOVE FROM CART
  // =========================

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
      alert(error.message);
    }
  };

  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = async () => {
    try {
      const response = await fetch(ORDER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setOrders([...orders, data]);

      setCart({
        ...cart,
        items: [],
      });

      alert("Order placed successfully!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const handleUpdateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      const response = await fetch(
        `${ORDER_URL}/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setOrders(
        orders.map((order) =>
          order._id === orderId ? data : order
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    }
  };

  // =========================
  // LOGIN / REGISTER
  // =========================

  if (!token) {
    return (
      <div className="auth-container">
        <h1>🛒 Grocery Store</h1>

        <h2>
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={authName}
              onChange={(e) =>
                setAuthName(e.target.value)
              }
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) =>
              setAuthEmail(e.target.value)
            }
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

        <button
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Create an account"
            : "Already have an account? Login"}
        </button>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="app">
      <header>
        <h1>🛒 Grocery Store</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* ADD / EDIT PRODUCT */}

      <section>
        <h2>
          {editingId
            ? "Edit Product"
            : "Add Product"}
        </h2>

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            required
          />

          <button type="submit">
            {editingId
              ? "Update Product"
              : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setPrice("");
                setCategory("");
                setStock("");
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* PRODUCTS */}

      <section>
        <h2>Products</h2>

        <div className="products-grid">
          {products.map((product) => (
            <div
              className="product-card"
              key={product._id}
            >
              <h3>{product.name}</h3>

              <p className="price">
                ₹{product.price}
              </p>

              <p>
                Category: {product.category}
              </p>

              <p>
                Stock: {product.stock}
              </p>

              <div className="product-buttons">
                <button
                  onClick={() =>
                    handleAddToCart(product._id)
                  }
                  disabled={product.stock === 0}
                >
                  {product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                <button
                  onClick={() =>
                    handleEdit(product)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(product._id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CART */}

      <section>
        <h2>Cart</h2>

        {cart &&
          cart.items.length === 0 && (
            <p>Cart is empty</p>
          )}

        {cart &&
          cart.items.map((item) => (
            <div
              className="cart-item"
              key={item._id}
            >
              <p>
                {item.product.name} - ₹
                {item.product.price}
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

              <span>
                {" "}
                {item.quantity}{" "}
              </span>

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
                  handleRemoveFromCart(
                    item.product._id
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}

        {cart &&
          cart.items.length > 0 && (
            <div className="cart-total">
              <h3>
                Total: ₹
                {cart.items.reduce(
                  (total, item) =>
                    total +
                    item.product.price *
                      item.quantity,
                  0
                )}
              </h3>

              <button
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          )}
      </section>

      {/* ORDERS */}

      <section>
        <h2>My Orders</h2>

        {orders.length === 0 && (
          <p>No orders yet.</p>
        )}

        {orders.map((order) => (
          <div
            className="order-card"
            key={order._id}
          >
            <h3>Order</h3>

            <p>
              <strong>Order ID:</strong>{" "}
              {order._id}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {order.status}
            </p>

            <h4>Items:</h4>

            {order.items.map((item) => (
              <p key={item._id}>
                {item.product
                  ? `${item.product.name} × ${
                      item.quantity
                    } = ₹${
                      item.price *
                      item.quantity
                    }`
                  : `Product deleted × ${
                      item.quantity
                    } = ₹${
                      item.price *
                      item.quantity
                    }`}
              </p>
            ))}

            <h3>
              Total: ₹{order.totalAmount}
            </h3>

            <select
              value={order.status}
              onChange={(e) =>
                handleUpdateOrderStatus(
                  order._id,
                  e.target.value
                )
              }
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Shipped">
                Shipped
              </option>

              <option value="Delivered">
                Delivered
              </option>
            </select>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;