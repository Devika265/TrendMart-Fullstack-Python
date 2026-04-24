from fastapi import FastAPI
from app.routers import contacts, dashboard, products, orders, subscribers, login, offers, milestones, feedback
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TrendMart Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(contacts.router)
app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(subscribers.router)
app.include_router(login.router)
app.include_router(offers.router)
app.include_router(milestones.router)
app.include_router(feedback.router)

