from flask import Flask
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from the .env file

def create_app():
    app = Flask(__name__)

    # Set up MongoDB URI and Secret Key
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")  
    app.secret_key = os.getenv("SECRET_KEY")

    print("MONGO_URI:", app.config["MONGO_URI"])

    # Initialize PyMongo
    mongo = PyMongo(app)
    app.mongo = mongo 

    # Register blueprints
    from .routes import main
    app.register_blueprint(main)

    return app
