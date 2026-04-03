import { useEffect, useState } from "react";
import API from "../services/api";

export default function Admin() {
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    price: "",
    availability: true,
    image: null
  });

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState({
    name: "",
    min_price: "",
    max_price: "",
    available: ""
  });

  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editField, setEditField] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    const data = new FormData();
    data.append("product_id", form.product_id);
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("availability", form.availability);
    if (form.image) data.append("image", form.image);

    await API.post("/add-product", data);
    showNotification("Product added successfully!");
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await API.delete(`/delete-product/${id}`);
    showNotification("Product deleted.", "error");
    fetchProducts();
  };

  const handleRename = async (id) => {
    await API.put(`/rename-product/${id}`, { name: editValue });
    setEditMode(null);
    setEditField(null);
    showNotification("Product renamed!");
    fetchProducts();
  };

  const handlePriceUpdate = async (id) => {
    await API.put(`/update-price/${id}`, { price: Number(editValue) });
    setEditMode(null);
    setEditField(null);
    showNotification("Price updated!");
    fetchProducts();
  };

  const handleSearch = async () => {
    const params = {};
    if (search.name) params.name = search.name;
    if (search.min_price) params.min_price = search.min_price;
    if (search.max_price) params.max_price = search.max_price;
    if (search.available !== "") params.available = search.available === "true";
    const res = await API.get("/search", { params });
    setProducts(res.data.products);
  };

  return (
    <div className="admin-wrapper">

      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast--${notification.type}`}>
          <span className="toast__icon">{notification.type === "success" ? "✓" : "✕"}</span>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__left">
          <div className="admin-logo">
            <span className="admin-logo__icon">⬡</span>
          </div>
          <div>
            <h1 className="admin-title">Admin Console</h1>
            <p className="admin-subtitle">Product Management Dashboard</p>
          </div>
        </div>
        <div className="admin-header__right">
          <span className="header-badge">{products.length} Products</span>
        </div>
      </header>

      <div className="admin-body">

        {/* Left Panel */}
        <aside className="admin-sidebar">

          {/* Add Product Card */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__icon">＋</span>
              <h2 className="panel__title">New Product</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                className="form-input"
                placeholder="e.g. SKU-001"
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                className="form-input"
                placeholder="e.g. Ceramic Mug"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Image</label>
              <label className="file-upload">
                <input
                  type="file"
                  className="file-upload__input"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
                <span className="file-upload__icon">📎</span>
                <span className="file-upload__text">
                  {form.image ? form.image.name : "Choose file…"}
                </span>
              </label>
            </div>

            <button className="btn btn--primary btn--full" onClick={handleAdd}>
              Add Product
            </button>
          </div>

          {/* Search Card */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__icon">⌕</span>
              <h2 className="panel__title">Filter</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Search by Name</label>
              <input
                className="form-input"
                placeholder="Product name…"
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min ₹</label>
                <input
                  className="form-input"
                  placeholder="0"
                  onChange={(e) => setSearch({ ...search, min_price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max ₹</label>
                <input
                  className="form-input"
                  placeholder="∞"
                  onChange={(e) => setSearch({ ...search, max_price: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                className="form-input form-select"
                onChange={(e) => setSearch({ ...search, available: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            <div className="btn-row">
              <button className="btn btn--primary" onClick={handleSearch}>Search</button>
              <button className="btn btn--ghost" onClick={fetchProducts}>Reset</button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="admin-main">
          <div className="products-header">
            <h2 className="products-title">All Products</h2>
            {isLoading && <span className="loading-dot" />}
          </div>

          {products.length === 0 && !isLoading && (
            <div className="empty-state">
              <span className="empty-state__icon">📦</span>
              <p>No products found. Add your first product!</p>
            </div>
          )}

          <div className="products-grid">
            {products.map((p) => (
              <div key={p.product_id} className="product-card">

                {/* Product Image */}
                <div className="product-card__image-wrap">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="product-card__image" />
                  ) : (
                    <div className="product-card__image-placeholder">
                      <span>🛍</span>
                    </div>
                  )}
                  <span className={`availability-badge ${p.availability ? "availability-badge--in" : "availability-badge--out"}`}>
                    {p.availability ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Info */}
                <div className="product-card__body">
                  <p className="product-card__id">#{p.product_id}</p>
                  <h3 className="product-card__name">{p.name}</h3>
                  <p className="product-card__price">₹{p.price}</p>
                </div>

                {/* QR Code */}
                {p.qr_code_url && (
                  <div className="product-card__qr">
                    <img src={p.qr_code_url} alt="QR code" className="qr-img" />
                    <div className="qr-info">
                      <span className="qr-label">QR Code</span>
                      <a
                        href={p.qr_code_url}
                        download={`qr-${p.product_id}.png`}
                        className="qr-download-btn"
                      >
                        ↓ Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Edit Section */}
                {editMode === p.product_id ? (
                  <div className="edit-section">
                    <input
                      className="form-input form-input--sm"
                      placeholder={editField === "name" ? "New name…" : "New price…"}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className={`btn btn--sm ${editField === "name" ? "btn--primary" : "btn--outline"}`}
                        onClick={() => setEditField("name")}
                      >
                        Rename
                      </button>
                      <button
                        className={`btn btn--sm ${editField === "price" ? "btn--primary" : "btn--outline"}`}
                        onClick={() => setEditField("price")}
                      >
                        Price
                      </button>
                      <button
                        className="btn btn--sm btn--primary"
                        onClick={() =>
                          editField === "price"
                            ? handlePriceUpdate(p.product_id)
                            : handleRename(p.product_id)
                        }
                      >
                        Save
                      </button>
                      <button
                        className="btn btn--sm btn--ghost"
                        onClick={() => { setEditMode(null); setEditField(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="product-card__actions">
                    <button
                      className="btn btn--sm btn--outline"
                      onClick={() => { setEditMode(p.product_id); setEditField("name"); }}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => handleDelete(p.product_id)}
                    >
                      ✕ Delete
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}