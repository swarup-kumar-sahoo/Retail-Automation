import os
from fastapi import FastAPI
from routes import cart_routes, product_routes, payment_routes, auth_routes
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.include_router(product_routes.router, prefix="/api")
app.include_router(cart_routes.router, prefix="/api")
app.include_router(payment_routes.router, prefix="/api")
app.include_router(auth_routes.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Retail Fast Payment API"}