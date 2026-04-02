from pymongo import MongoClient

client = MongoClient("mongodb+srv://kumarswarup7272_db_user:2J399ZvwGX9KM8TC@mycluster.rfoxxq2.mongodb.net/?appName=myCluster")
db = client["retail_db"]

products_collection = db["products"]
cart_collection = db["cart"]
users_collection = db["users"]