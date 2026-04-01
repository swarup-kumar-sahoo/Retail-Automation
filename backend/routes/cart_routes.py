from fastapi import APIRouter, Depends
from database import cart_collection, products_collection
from auth.auth_dependency import get_current_user

router = APIRouter()


@router.post("/scan/{product_id}")
def scan_product(product_id: str, user=Depends(get_current_user)):
    email = user["email"]

    product = products_collection.find_one({"product_id": product_id})
    if not product:
        return {"error": "Product not found"}

    existing = cart_collection.find_one({
        "product_id": product_id,
        "user": email
    })

    if existing:
        cart_collection.update_one(
            {"product_id": product_id, "user": email},
            {"$inc": {"quantity": 1}}
        )
    else:
        cart_collection.insert_one({
            "product_id": product_id,
            "name": product["name"],
            "price": product["price"],
            "quantity": 1,
            "user": email  
        })

    return {"message": "Product scanned"}


# 🛒 Get Cart
@router.get("/cart")
def get_cart(user=Depends(get_current_user)):
    email = user["email"]

    items = list(cart_collection.find({"user": email}, {"_id": 0}))

    total = sum(item["price"] * item["quantity"] for item in items)

    return {
        "items": items,
        "total": total
    }


# 🧹 Clear Cart (Bonus)
@router.delete("/clear-cart")
def clear_cart():
    cart_collection.delete_many({})
    return {"message": "Cart cleared"}