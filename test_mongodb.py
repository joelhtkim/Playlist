from pymongo import MongoClient
uri = "mongodb+srv://joelhtkim:Anthony69@cluster0.kyksv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Replace with your actual URI
client = MongoClient(uri)
try:
    # Test the connection
    client.admin.command('ping')
    print("MongoDB connection successful!")
    # List databases
    print("Available databases:", client.list_database_names())
except Exception as e:
    print(f"MongoDB connection failed: {e}")