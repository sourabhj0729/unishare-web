
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";

const categories = [
  "All",
  "Books",
  "Electronics",
  "Accessories",
  "Stationery",
  "Other"
];

const demoProducts = [
  {
    id: "demo1",
    title: "Engineering Mathematics Book",
    description: "Good condition, barely used.",
    price: 250,
    category: "Books",
    status: "AVAILABLE"
  },
  {
    id: "demo2",
    title: "Scientific Calculator",
    description: "Fully working calculator.",
    price: 450,
    category: "Electronics",
    status: "AVAILABLE"
  },
  {
    id: "demo3",
    title: "Laptop Stand",
    description: "Aluminium adjustable laptop stand.",
    price: 350,
    category: "Accessories",
    status: "AVAILABLE"
  },
  {
    id: "demo4",
    title: "DSA Notes",
    description: "Complete handwritten DSA notes.",
    price: 100,
    category: "Stationery",
    status: "AVAILABLE"
  }
];

function App() {
  const [products, setProducts] = useState([]);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("unishareUser"));
    } catch {
      return null;
    }
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("marketplace");
  const [authMode, setAuthMode] = useState("login");

  const [showAuth, setShowAuth] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [apiAvailable, setApiAvailable] = useState(false);

  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    collegeName: ""
  });

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    imageUrl: ""
  });

  // Load products from backend
  async function loadProducts() {
    try {
      const response = await fetch(`${API}/products`);

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
      setApiAvailable(true);

    } catch (error) {
      console.error("Product loading error:", error);
      setApiAvailable(false);
      setProducts([]);
    }
  }

  // Load orders of logged-in student
  async function loadOrders(studentId) {
    try {
      const response = await fetch(
        `${API}/orders?buyerId=${studentId}`
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Order loading error:", error);
      setOrders([]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadOrders(user.id);
    }
  }, [user]);

  // Search and category filtering
  const visibleProducts = useMemo(() => {
    const source = apiAvailable ? products : demoProducts;

    return source.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        `${product.title} ${product.description || ""} ${product.category || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesCategory &&
        matchesSearch &&
        product.status !== "SOLD"
      );
    });
  }, [products, apiAvailable, activeCategory, search]);

  // Display notification
  function notify(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  }

  // Student login and registration
  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);

    const endpoint =
      authMode === "login" ? "login" : "register";

    const payload =
      authMode === "login"
        ? {
            email: authForm.email,
            password: authForm.password
          }
        : authForm;

    try {
      const response = await fetch(
        `${API}/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Authentication failed"
        );
      }

      setUser(data);

      localStorage.setItem(
        "unishareUser",
        JSON.stringify(data)
      );

      setShowAuth(false);

      setAuthForm({
        fullName: "",
        email: "",
        password: "",
        collegeName: ""
      });

      notify(
        `Welcome to UniShare, ${data.fullName || "student"}!`
      );

    } catch (error) {
      notify(
        error.message || "Could not connect to backend."
      );
    } finally {
      setLoading(false);
    }
  }

  // Add product listing
  async function handleAddProduct(e) {
    e.preventDefault();

    if (!user?.id) {
      setShowAdd(false);
      setAuthMode("login");
      setShowAuth(true);
      notify("Please log in before listing a product.");
      return;
    }

    if (
      !productForm.title.trim() ||
      !productForm.category ||
      Number(productForm.price) <= 0
    ) {
      notify("Please enter valid product details.");
      return;
    }

    setLoading(true);

    // IMPORTANT: Backend expects sellerId, not seller object
    const payload = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      category: productForm.category,
      imageUrl: productForm.imageUrl.trim() || null,
      listingType: "SALE",
      sellerId: Number(user.id)
    };

    try {
      const response = await fetch(
        `${API}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          error || "Could not create listing"
        );
      }

      setShowAdd(false);

      setProductForm({
        title: "",
        description: "",
        price: "",
        category: "Books",
        imageUrl: ""
      });

      await loadProducts();

      notify("Your product has been listed successfully!");

    } catch (error) {
      notify(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Purchase product
  async function handleBuy(product) {
    if (!user?.id) {
      setAuthMode("login");
      setShowAuth(true);
      notify("Please log in to buy a product.");
      return;
    }

    if (String(product.id).startsWith("demo")) {
      notify(
        "Demo product only. Add real products after connecting to the database."
      );
      return;
    }

    if (
      !window.confirm(
        `Place an order for ${product.title}?`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            buyerId: user.id,
            productId: product.id
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          error || "Order could not be placed"
        );
      }

      await loadProducts();
      await loadOrders(user.id);

      notify("Order placed successfully!");

    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Logout
  function logout() {
    setUser(null);

    localStorage.removeItem("unishareUser");

    setOrders([]);
    setPage("marketplace");

    notify("You have logged out.");
  }

  function openLogin() {
    setAuthMode("login");
    setShowAuth(true);
  }

  return (
    <div className="app">

      {/* NAVIGATION */}
      <header className="navbar">

        <a
          className="brand"
          href="#"
          onClick={() => setPage("marketplace")}
        >
          <span className="brand-icon">U</span>
          <span>
            Uni<span>Share</span>
          </span>
        </a>

        <div className="nav-links">

          <button
            className={
              page === "marketplace"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => setPage("marketplace")}
          >
            Marketplace
          </button>

          <button
            className={
              page === "orders"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() => {
              if (!user) return openLogin();
              setPage("orders");
            }}
          >
            My Orders
          </button>

        </div>

        <div className="nav-actions">

          {user ? (
            <>
              <span className="user-name">
                Hi, {user.fullName?.split(" ")[0]}
              </span>

              <button
                className="btn btn-outline"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-text"
                onClick={openLogin}
              >
                Log in
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              >
                Sign up
              </button>
            </>
          )}

        </div>
      </header>

      <main>

        {page === "marketplace" ? (
          <>

            {/* HERO SECTION */}
            <section className="hero">

              <div className="hero-content">

                <div className="eyebrow">
                  YOUR CAMPUS. YOUR COMMUNITY.
                </div>

                <h1>
                  Buy, sell & share.
                  <br />
                  <span>All on campus.</span>
                </h1>

                <p>
                  The student marketplace for everything you need.
                  Discover great deals and connect with students
                  at your college.
                </p>

                <div className="hero-buttons">

                  <button
                    className="btn btn-primary btn-large"
                    onClick={() =>
                      document
                        .getElementById("marketplace")
                        ?.scrollIntoView({
                          behavior: "smooth"
                        })
                    }
                  >
                    Explore marketplace →
                  </button>

                  <button
                    className="btn btn-light btn-large"
                    onClick={() =>
                      user ? setShowAdd(true) : openLogin()
                    }
                  >
                    + Sell an item
                  </button>

                </div>

                <div className="hero-stats">

                  <div>
                    <strong>Student</strong>
                    <small>Community</small>
                  </div>

                  <div>
                    <strong>Affordable</strong>
                    <small>Campus deals</small>
                  </div>

                  <div>
                    <strong>Simple</strong>
                    <small>Local exchange</small>
                  </div>

                </div>
              </div>

              <div className="hero-art">

                <div className="art-circle">

                  <div className="floating-card card-book">
                    📚 <span>Books</span>
                  </div>

                  <div className="floating-card card-laptop">
                    💻 <span>Gadgets</span>
                  </div>

                  <div className="floating-card card-bag">
                    🎒 <span>Essentials</span>
                  </div>

                  <div className="art-center">U</div>

                </div>
              </div>

            </section>

            {/* MARKETPLACE */}
            <section
              className="market-section"
              id="marketplace"
            >

              <div className="section-heading">

                <div>
                  <div className="eyebrow">
                    CAMPUS MARKETPLACE
                  </div>

                  <h2>Find what you need.</h2>

                  <p>
                    Great stuff, fair prices, and
                    student-to-student deals.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    user ? setShowAdd(true) : openLogin()
                  }
                >
                  + Add a listing
                </button>

              </div>

              {!apiAvailable && (
                <div className="demo-notice">
                  Showing sample products because the backend
                  API is unavailable.
                </div>
              )}

              {/* SEARCH */}
              <div className="search-row">

                <div className="search-box">

                  <span>⌕</span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search books, electronics, notes..."
                  />

                  {search && (
                    <button onClick={() => setSearch("")}>
                      ×
                    </button>
                  )}

                </div>

                <button
                  className="btn btn-outline"
                  onClick={loadProducts}
                >
                  ↻ Refresh
                </button>

              </div>

              {/* CATEGORIES */}
              <div className="category-list">

                {categories.map((category) => (
                  <button
                    key={category}
                    className={
                      activeCategory === category
                        ? "category active"
                        : "category"
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}

              </div>

              <div className="results-label">
                <strong>{visibleProducts.length} items</strong>
                {" "}available
              </div>

              {/* PRODUCT CARDS */}
              <div className="product-grid">

                {visibleProducts.map((product) => (
                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-image">

                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>
                          {product.category === "Books"
                            ? "📚"
                            : product.category === "Electronics"
                            ? "💻"
                            : product.category === "Accessories"
                            ? "🎒"
                            : product.category === "Stationery"
                            ? "✏️"
                            : "📦"}
                        </span>
                      )}

                      <span className="product-tag">
                        {product.category}
                      </span>

                    </div>

                    <div className="product-info">

                      <h3>{product.title}</h3>

                      <p>
                        {product.description ||
                          "Available from a fellow student."}
                      </p>

                      <div className="product-bottom">

                        <strong>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </strong>

                        <button
                          className="btn btn-small btn-primary"
                          disabled={
                            loading ||
                            product.status === "SOLD"
                          }
                          onClick={() => handleBuy(product)}
                        >
                          Buy now
                        </button>

                      </div>
                    </div>

                  </article>
                ))}

              </div>

              {visibleProducts.length === 0 && (
                <div className="empty-state">

                  <div>🔎</div>

                  <h3>No products found</h3>

                  <p>
                    Try another search or category.
                  </p>

                </div>
              )}

            </section>

          </>
        ) : (

          /* MY ORDERS */
          <section className="orders-section">

            <div className="eyebrow">
              YOUR ACTIVITY
            </div>

            <h2>My Orders</h2>

            <p>
              Track the products you have ordered.
            </p>

            {orders.length ? (

              <div className="orders-list">

                {orders.map((order) => (
                  <div
                    className="order-card"
                    key={order.id}
                  >

                    <div>
                      <strong>Order #{order.id}</strong>

                      <p>
                        {order.product?.title || "Product order"}
                      </p>
                    </div>

                    <span className="order-status">
                      {order.status}
                    </span>

                  </div>
                ))}

              </div>

            ) : (

              <div className="empty-state">

                <div>🛍️</div>

                <h3>No orders yet</h3>

                <p>
                  Explore the marketplace and find something useful.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() => setPage("marketplace")}
                >
                  Explore marketplace
                </button>

              </div>

            )}

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer">

        <div className="brand">
          <span className="brand-icon">U</span>
          UniShare
        </div>

        <p>
          Made for students, by students.
          Find it. Share it. Keep it on campus.
        </p>

        <small>
          © 2026 UniShare. College community marketplace.
        </small>

      </footer>

      {message && (
        <div className="toast">
          {message}
        </div>
      )}

      {/* LOGIN / REGISTER MODAL */}
      {showAuth && (

        <div
          className="modal-backdrop"
          onClick={() => setShowAuth(false)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>

            <div className="eyebrow">
              WELCOME TO UNISHARE
            </div>

            <h2>
              {authMode === "login"
                ? "Welcome back!"
                : "Create your account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Log in to your student account."
                : "Join your campus marketplace."}
            </p>

            <form onSubmit={handleAuth}>

              {authMode === "register" && (
                <>

                  <label>Full name</label>

                  <input
                    required
                    value={authForm.fullName}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        fullName: e.target.value
                      })
                    }
                    placeholder="Your full name"
                  />

                  <label>College name</label>

                  <input
                    required
                    value={authForm.collegeName}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        collegeName: e.target.value
                      })
                    }
                    placeholder="Your college"
                  />

                </>
              )}

              <label>Email address</label>

              <input
                required
                type="email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    email: e.target.value
                  })
                }
                placeholder="student@example.com"
              />

              <label>Password</label>

              <input
                required
                type="password"
                minLength="6"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    password: e.target.value
                  })
                }
                placeholder="Enter your password"
              />

              <button
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Log in"
                  : "Create account"}
              </button>

            </form>

            <div className="modal-switch">

              {authMode === "login"
                ? "New to UniShare?"
                : "Already have an account?"}

              <button
                onClick={() =>
                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  )
                }
              >
                {authMode === "login"
                  ? "Create account"
                  : "Log in"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAdd && (

        <div
          className="modal-backdrop"
          onClick={() => setShowAdd(false)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowAdd(false)}
            >
              ×
            </button>

            <div className="eyebrow">
              SELL ON CAMPUS
            </div>

            <h2>List a product</h2>

            <p>
              Give your useful items a second life.
            </p>

            <form onSubmit={handleAddProduct}>

              <label>Product title</label>

              <input
                required
                maxLength="100"
                value={productForm.title}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    title: e.target.value
                  })
                }
                placeholder="e.g. Engineering Mathematics Book"
              />

              <label>Description</label>

              <textarea
                required
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value
                  })
                }
                placeholder="Describe your product..."
              />

              <div className="form-row">

                <div>
                  <label>Price (₹)</label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: e.target.value
                      })
                    }
                    placeholder="250"
                  />
                </div>

                <div>
                  <label>Category</label>

                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value
                      })
                    }
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </div>

              </div>

              <label>Image URL (optional)</label>

              <input
                value={productForm.imageUrl}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    imageUrl: e.target.value
                  })
                }
                placeholder="https://..."
              />

              <button
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading
                  ? "Publishing..."
                  : "Publish listing"}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
