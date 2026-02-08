"""
Rate limiting middleware to prevent API abuse.
"""
import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.

    Limits requests per IP address to prevent abuse.
    For production, consider using Redis for distributed rate limiting.
    """

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # seconds
        # Store: {ip_address: [(timestamp, count)]}
        self.request_counts: Dict[str, list] = defaultdict(list)

    def _clean_old_requests(self, ip: str, current_time: float):
        """Remove requests older than the time window."""
        cutoff_time = current_time - self.window_size
        self.request_counts[ip] = [
            (timestamp, count)
            for timestamp, count in self.request_counts[ip]
            if timestamp > cutoff_time
        ]

    def _get_request_count(self, ip: str, current_time: float) -> int:
        """Get total request count for IP in current window."""
        self._clean_old_requests(ip, current_time)
        return sum(count for _, count in self.request_counts[ip])

    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Skip rate limiting for health check and root endpoints
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Get client IP address
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        # Check rate limit
        request_count = self._get_request_count(client_ip, current_time)

        if request_count >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
            )

        # Record this request
        self.request_counts[client_ip].append((current_time, 1))

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.requests_per_minute - request_count - 1)
        )
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.window_size))

        return response
