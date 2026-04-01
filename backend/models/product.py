from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    product_id: str
    name: str
    price: float
    availability: bool = True   
    image_url: Optional[str] = None  
    qr_code_url: Optional[str] = None