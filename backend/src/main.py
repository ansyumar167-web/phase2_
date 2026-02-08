"""
FastAPI application entry point.
"""
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import health, tasks, auth
from .middleware.rate_limit import RateLimitMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    description="RESTful API for Todo Full-Stack Web Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add rate limiting middleware (60 requests per minute per IP)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)


# Request/Response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and responses with timing."""
    start_time = time.time()

    # Log request
    logger.info(f"→ {request.method} {request.url.path}")

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    # Log response
    logger.info(
        f"← {request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Duration: {duration:.3f}s"
    )

    return response

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])


@app.get("/")
async def root():
    """Root endpoint for health checks and monitoring."""
    return {
        "message": "Todo App API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    print(f"[STARTUP] Todo App API starting on {settings.host}:{settings.port}")
    print(f"[INFO] API Documentation: http://{settings.host}:{settings.port}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    print("[SHUTDOWN] Todo App API shutting down")
