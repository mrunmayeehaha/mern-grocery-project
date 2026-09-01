
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const BASE_URL = "https://mern-grocery-project.onrender.com";

  const API_URL = BASE_URL + "/api/products";
  const AUTH_URL = BASE_URL + "/api/auth";
  const CART_URL = BASE_URL + "/api/cart";
  const ORDER_URL = BASE_URL + "/api/orders";

  // =========================
  // AUTH
  // =========================

  const [isLogin, setIsLogin] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || "user"
  );

  const isAdmin = userRole === "admin";

  // =========================
  // PRODUCTS
  // =========================

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState(null);

  // =========================
  // ORDERS
  // =========================

  const [orders, setOrders] = useState([]);

  // =========================
  // SEARCH / FILTER
  // =========================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
        throw new Error(data.message || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);

        /*
          Decode JWT payload to get user role.

          Your backend already puts:
          {
            id: user._id,
            role: user.role
          }
          inside the token.
        */

        try {
          const payload = JSON.parse(
            atob(data.token.split(".")[1])
          );

          const role = payload.role || "user";

          localStorage.setItem("role", role);

          setUserRole(role);
        } catch (decodeError) {
          console.error("Token decode error:", decodeError);

          localStorage.setItem("role", "user");
          setUserRole("user");
        }

        setToken(data.token);
      } else {
        alert("Registration successful! Now login.");
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
    localStorage.removeItem("role");

    setToken(null);
    setUserRole("user");

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

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load products"
          );
        }

        setProducts(Array.isArray(data) ? data : []);
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

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load cart"
          );
        }

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

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load orders"
          );
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Orders error:", error);
      }
    };

    fetchOrders();
  }, [token]);

  // =========================
  // ADD / UPDATE PRODUCT
  // ADMIN ONLY
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Only admins can manage products.");
      return;
    }

    const productData = {
      name,
      price: Number(price),
      category,
      stock: Number(stock),
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
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((product) =>
            product._id === editingId ? data : product
          )
        );
      } else {
        setProducts((prev) => [...prev, data]);
      }

      clearProductForm();
    } catch (error) {
      console.error("Product error:", error);
      alert(error.message);
    }
  };

  // =========================
  // CLEAR PRODUCT FORM
  // =========================

  const clearProductForm = () => {
    setName("");
    setPrice("");
    setCategory("");
    setStock("");
    setEditingId(null);
  };

  // =========================
  // EDIT PRODUCT
  // ADMIN ONLY
  // =========================

  const handleEdit = (product) => {
    if (!isAdmin) {
      alert("Only admins can edit products.");
      return;
    }

    setName(product.name || "");
    setPrice(product.price ?? "");
    setCategory(product.category || "");
    setStock(product.stock ?? "");
    setEditingId(product._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE PRODUCT
  // ADMIN ONLY
  // =========================

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete products.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
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
        throw new Error(
          data.message || "Failed to update cart"
        );
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
    if (!productId) return;

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
        throw new Error(
          data.message || "Failed to remove item"
        );
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
        throw new Error(
          data.message || "Checkout failed"
        );
      }

      setOrders((prev) => [...prev, data]);

      setCart((prev) =>
        prev
          ? {
              ...prev,
              items: [],
            }
          : prev
      );

      alert("Order placed successfully!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // ADMIN ONLY
  // =========================

  const handleUpdateOrderStatus = async (
    orderId,
    status
  ) => {
    if (!isAdmin) {
      alert("Only admins can update order status.");
      return;
    }

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
        throw new Error(
          data.message || "Failed to update order"
        );
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? data : order
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    }
  };

  // =========================
  // FILTER PRODUCTS
  // =========================

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const productName = product.name || "";
    const productCategory = product.category || "";

    const matchesSearch = productName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      productCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // =========================
  // CART TOTAL
  // =========================

  const cartItems = cart?.items || [];

  const cartTotal = cartItems.reduce((total, item) => {
    if (!item?.product) {
      return total;
    }

    const itemPrice = Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + itemPrice * quantity;
  }, 0);

  const cartItemCount = cartItems.reduce(
    (total, item) =>
      total + (Number(item?.quantity) || 0),
    0
  );

  // =========================
  // LOGIN / REGISTER PAGE
  // =========================

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🛒</div>

          <h1>FreshCart</h1>

          <p className="auth-subtitle">
            Fresh groceries, delivered simply.
          </p>

          <div className="auth-tabs">
            <button
              className={isLogin ? "active-tab" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>

            <button
              className={!isLogin ? "active-tab" : ""}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="input-group">
                <label>Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={authName}
                  onChange={(e) =>
                    setAuthName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={authEmail}
                onChange={(e) =>
                  setAuthEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={authPassword}
                onChange={(e) =>
                  setAuthPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              className="primary-btn"
              type="submit"
            >
              {isLogin
                ? "Login →"
                : "Create Account →"}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? " Register" : " Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN APP
  // =========================

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🛒</div>

          <div>
            <h1>FreshCart</h1>
            <span>Grocery Store</span>
          </div>
        </div>

        <div className="nav-actions">
          <a href="#products">Products</a>

          <a href="#cart">
            Cart
            {cartItemCount > 0 && (
              <span className="cart-badge">
                {cartItemCount}
              </span>
            )}
          </a>

          <a href="#orders">Orders</a>

          {isAdmin && (
            <span className="admin-badge">
              Admin
            </span>
          )}

          {!isAdmin && (
            <span className="user-badge">
              User
            </span>
          )}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            🌱 Fresh • Simple • Convenient
          </span>

          <h2>
            Fresh groceries.
            <br />
            <span>Delivered to you.</span>
          </h2>

          <p>
            Shop your everyday essentials from one
            simple grocery store.
          </p>

          <a
            href="#products"
            className="hero-btn"
          >
            Shop Now ↓
          </a>
        </div>

        <div className="hero-emoji">
          🥑
        </div>
      </section>

      {/* ================= ADMIN PRODUCT MANAGEMENT ================= */}

      {isAdmin && (
        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                ADMIN PANEL
              </span>

              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>
            </div>
          </div>

          <form
            className="product-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label>Product Name</label>

              <input
                type="text"
                placeholder="e.g. Fresh Apples"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label>Price</label>

              <input
                type="number"
                min="0"
                placeholder="₹ 100"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label>Category</label>

              <input
                type="text"
                placeholder="e.g. Fruits"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label>Stock</label>

              <input
                type="number"
                min="0"
                placeholder="20"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                required
              />
            </div>

            <button
              className="add-product-btn"
              type="submit"
            >
              {editingId
                ? "Update Product"
                : "+ Add Product"}
            </button>

            {editingId && (
              <button
                className="cancel-btn"
                type="button"
                onClick={clearProductForm}
              >
                Cancel
              </button>
            )}
          </form>
        </section>
      )}

      {/* ================= PRODUCTS ================= */}

      <section
        className="products-section"
        id="products"
      >
        <div className="section-top">
          <div>
            <span className="section-label">
              OUR PRODUCTS
            </span>

            <h2>Fresh Picks</h2>

            <p>
              Everything you need for your kitchen.
            </p>
          </div>

          <div className="product-count">
            {filteredProducts.length} products
          </div>
        </div>

        {/* SEARCH */}

        <div className="search-area">
          <div className="search-box">
            🔍

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="category-buttons">
            {categories.map((cat) => (
              <button
                key={cat}
                className={
                  selectedCategory === cat
                    ? "category-active"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(cat)
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-products">
            <div>🥕</div>

            <h3>No products found</h3>

            <p>
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const productPrice =
                Number(product.price) || 0;

              const productStock =
                Number(product.stock) || 0;

              return (
                <div
                  className="product-card"
                  key={product._id}
                >
                  <div className="product-image">
                    {product.category
                      ?.toLowerCase()
                      .includes("fruit")
                      ? "🍎"
                      : product.category
                          ?.toLowerCase()
                          .includes("vegetable")
                      ? "🥦"
                      : product.category
                          ?.toLowerCase()
                          .includes("dairy")
                      ? "🥛"
                      : product.category
                          ?.toLowerCase()
                          .includes("bakery")
                      ? "🥖"
                      : "🛍️"}

                    {productStock === 0 && (
                      <span className="stock-badge">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="product-bottom">
                      <div>
                        <span className="product-price">
                          ₹{productPrice}
                        </span>

                        <span className="stock-text">
                          {productStock} in stock
                        </span>
                      </div>

                      <button
                        className="cart-btn"
                        onClick={() =>
                          handleAddToCart(
                            product._id
                          )
                        }
                        disabled={
                          productStock === 0
                        }
                      >
                        {productStock === 0
                          ? "Sold Out"
                          : "+ Cart"}
                      </button>
                    </div>

                    {/* ADMIN BUTTONS */}

                    {isAdmin && (
                      <div className="admin-buttons">
                        <button
                          onClick={() =>
                            handleEdit(product)
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              product._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= CART ================= */}

      <section
        className="cart-section"
        id="cart"
      >
        <div className="section-top">
          <div>
            <span className="section-label">
              YOUR CART
            </span>

            <h2>Shopping Cart</h2>
          </div>

          <span className="cart-count">
            {cartItemCount} items
          </span>
        </div>

        {!cart || cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">
              🛒
            </div>

            <h3>Your cart is empty</h3>

            <p>
              Add some fresh groceries to get started.
            </p>

            <a href="#products">
              Browse Products →
            </a>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item) => {
                if (!item?.product) {
                  return (
                    <div
                      className="cart-item deleted-item"
                      key={item._id}
                    >
                      <div>
                        <h3>
                          Product unavailable
                        </h3>

                        <p>
                          This product is no longer
                          available.
                        </p>
                      </div>
                    </div>
                  );
                }

                const itemPrice =
                  Number(item.product.price) || 0;

                return (
                  <div
                    className="cart-item"
                    key={item._id}
                  >
                    <div className="cart-product-icon">
                      🛍️
                    </div>

                    <div className="cart-product-info">
                      <h3>
                        {item.product.name}
                      </h3>

                      <p>
                        ₹{itemPrice} each
                      </p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          item.quantity <= 1
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
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
                    </div>

                    <strong className="item-total">
                      ₹
                      {itemPrice *
                        (Number(item.quantity) ||
                          0)}
                    </strong>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        handleRemoveFromCart(
                          item.product._id
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <span>Cart Total</span>

              <h2>₹{cartTotal}</h2>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Checkout →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ================= ORDERS ================= */}

      <section
        className="orders-section"
        id="orders"
      >
        <div className="section-top">
          <div>
            <span className="section-label">
              ORDER HISTORY
            </span>

            <h2>My Orders</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div>📦</div>

            <h3>No orders yet</h3>

            <p>
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div
                className="order-card"
                key={order._id}
              >
                <div className="order-header">
                  <div>
                    <span>ORDER</span>

                    <h3>
                      #{order._id.slice(-6)}
                    </h3>
                  </div>

                  <span
                    className={`status ${
                      order.status?.toLowerCase()
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items?.map((item) => {
                    const itemPrice =
                      Number(item.price) || 0;

                    const quantity =
                      Number(item.quantity) || 0;

                    return (
                      <div
                        className="order-item"
                        key={item._id}
                      >
                        <span>
                          {item.product
                            ? item.product.name
                            : "Product deleted"}
                        </span>

                        <span>
                          × {quantity}
                        </span>

                        <strong>
                          ₹{itemPrice * quantity}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <div className="order-footer">
                  <strong>
                    Total: ₹
                    {Number(
                      order.totalAmount
                    ) || 0}
                  </strong>

                  {isAdmin ? (
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
                  ) : (
                    <span
                      className={`status ${
                        order.status?.toLowerCase()
                      }`}
                    >
                      {order.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <div className="footer-brand">
          🛒 FreshCart
        </div>

        <p>
          Fresh groceries. Simple shopping.
        </p>

        <span>
          © 2026 FreshCart
        </span>
      </footer>
    </div>
  );
}

export default App;

