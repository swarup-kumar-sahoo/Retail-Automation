from fastapi import APIRouter, UploadFile, HTTPException, File, Form
from database import products_collection
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload folder exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# ➕ Add Product
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

    image_url = None

    if image:
        # ✅ unique filename (important)
        filename = f"{uuid.uuid4()}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"http://127.0.0.1:8000/uploads/{filename}"

    product = {
        "product_id": product_id,
        "name": name,
        "price": price,
        "availability": availability,
        "image_url": image_url
    }

    product_copy = product.copy()

    products_collection.insert_one(product)
    
    def clean_doc(doc):
        doc.pop("_id", None)
        return doc

    return {
        "message": "Product added",
        "product": clean_doc(product_copy)
    }


# 📋 Get all products
@router.get("/products")
def get_products():
    return list(products_collection.find({}, {"_id": 0}))


# ❌ Delete product
@router.delete("/delete-product/{product_id}")
def delete_product(product_id: str):
    result = products_collection.delete_one({"product_id": product_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}


# ✏️ Rename product
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


# 💰 Update price
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