from fastapi import APIRouter, UploadFile, HTTPException, File, Form
from database import products_collection
import shutil
import os
import qrcode
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload folder exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# ➕ Add Product (Image + QR)
@router.post("/add-product")
def add_product(
    product_id: str = Form(...),
    name: str = Form(...),
    price: float = Form(...),
    availability: bool = Form(True),
    image: UploadFile = File(None)
):
    existing = products_collection.find_one({"product_id": product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Product already exists")

    # 🖼️ Image Upload
    image_url = None
    if image:
        filename = f"{uuid.uuid4()}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"https://retail-automation.onrender.com/uploads/{filename}"

    # 🔳 QR Code (ONLY product_id)
    qr_filename = f"qr_{product_id}.png"
    qr_path = os.path.join(UPLOAD_DIR, qr_filename)

    qr = qrcode.make(product_id)  
    qr.save(qr_path)

    qr_url = f"https://retail-automation.onrender.com/uploads/{qr_filename}"

    # 📦 Product Data
    product = {
        "product_id": product_id,
        "name": name,
        "price": price,
        "availability": availability,
        "image_url": image_url,
        "qr_code_url": qr_url
    }

    # ✅ Avoid Mongo _id issue
    product_copy = product.copy()

    products_collection.insert_one(product)

    return {
        "message": "Product added",
        "product": product_copy
    }


# 📋 Get All Products
@router.get("/products")
def get_products():
    return list(products_collection.find({}, {"_id": 0}))


# ❌ Delete Product
@router.delete("/delete-product/{product_id}")
def delete_product(product_id: str):
    result = products_collection.delete_one({"product_id": product_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}


# ✏️ Rename Product
@router.put("/rename-product/{product_id}")
def rename_product(product_id: str, data: dict):
    new_name = data.get("name")

    if not new_name:
        raise HTTPException(status_code=400, detail="New name required")

    result = products_collection.update_one(
        {"product_id": product_id},
        {"$set": {"name": new_name}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product renamed successfully"}


# 💰 Update Price
@router.put("/update-price/{product_id}")
def update_price(product_id: str, data: dict):
    new_price = data.get("price")

    if new_price is None:
        raise HTTPException(status_code=400, detail="Price required")

    result = products_collection.update_one(
        {"product_id": product_id},
        {"$set": {"price": new_price}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Price updated successfully"}


# 🔍 Search & Filter
@router.get("/search")
def search_products(
    name: str = None,
    min_price: float = None,
    max_price: float = None,
    available: bool = None
):
    query = {}

    if name:
        query["name"] = {"$regex": name, "$options": "i"}

    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price

    if available is not None:
        query["availability"] = available

    products = list(products_collection.find(query, {"_id": 0}))

    return {
        "count": len(products),
        "products": products
    }