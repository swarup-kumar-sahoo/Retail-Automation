from fastapi import APIRouter
from database import cart_collection

router = APIRouter()

@router.post("/pay")
def process_payment():
    items = list(cart_collection.find({}, {"_id": 0}))
    total = sum(item["price"] * item["quantity"] for item in items)

    # Clear cart after payment
    cart_collection.delete_many({})

    return {
        "message": "Payment successful",
        "bill": items,
        "total": total
    }