from pymongo import MongoClient
uri = "mongodb+srv://joelhtkim:Anthony69@cluster0.kyksv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  
client = MongoClient(uri)
try:
    client.admin.command('ping')
    print("MongoDB connection successful!")
    print("Available databases:", client.list_database_names())
except Exception as e:
    print(f"MongoDB connection failed: {e}")