from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import (
    contacts, 
    dashboard, 
    products, 
    orders, 
    subscribers, 
    login, 
    offers, 
    milestones, 
    feedback
)

app = FastAPI(title="TrendMart Admin API")

# Exact frontend origins allow pannunga (CORS issue fix aagum)
origins = [
    "https://trend-mart-fullstack-python.vercel.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static/Images folder exist aana mount pannum
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Routers
app.include_router(contacts.router)
app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(subscribers.router)
app.include_router(login.router)
app.include_router(offers.router)
app.include_router(milestones.router)
app.include_router(feedback.router)


@app.get("/")
def root():
    return {"message": "TrendMart Backend API is running successfully!"}