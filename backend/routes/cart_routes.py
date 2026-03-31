from fastapi import APIRouter
from database import cart_collection, products_collection

router = APIRouter()

@router.post("/scan/{product_id}")
def scan_product(product_id: str):
    product = products_collection.find_one({"product_id": product_id})
    
    if not product:
        return {"error": "Product not found"}

    existing = cart_collection.find_one({"product_id": product_id})

    if existing:
        cart_collection.update_one(
            {"product_id": product_id},
            {"$inc": {"quantity": 1}}
        )
    else:
        cart_collection.insert_one({
            "product_id": product_id,
            "name": product["name"],
            "price": product["price"],
            "quantity": 1
        })

    return {"message": "Product scanned"}

@router.get("/cart")
def get_cart():
    items = list(cart_collection.find({}, {"_id": 0}))
    
    total = sum(item["price"] * item["quantity"] for item in items)

    return {
        "items": items,
        "total": total
    }