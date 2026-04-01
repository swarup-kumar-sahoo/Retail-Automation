from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["retail_db"]

products_collection = db["products"]
cart_collection = db["cart"]
users_collection = db["users"]