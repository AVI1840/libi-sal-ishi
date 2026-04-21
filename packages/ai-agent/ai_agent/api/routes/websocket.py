"""
WebSocket endpoints for real-time updates.

Provides real-time alerts, conversation updates, and notifications
for case managers and family members.
"""

from datetime import datetime
from typing import Any
import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import structlog

from shared.auth import verify_token
from ai_agent.memory import get_mock_provider


logger = structlog.get_logger()
router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        # user_id -> list of websocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}
        # For case managers: subscribe to all alerts
        self.case_manager_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info("WebSocket connected", user_id=user_id)

    async def connect_case_manager(self, websocket: WebSocket) -> None:
        """Connect a case manager to receive all alerts."""
        await websocket.accept()
        self.case_manager_connections.append(websocket)
        logger.info("Case manager WebSocket connected")

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info("WebSocket disconnected", user_id=user_id)

    def disconnect_case_manager(self, websocket: WebSocket) -> None:
        """Disconnect a case manager."""
        if websocket in self.case_manager_connections:
            self.case_manager_connections.remove(websocket)
        logger.info("Case manager WebSocket disconnected")

    async def send_personal_message(self, message: dict, user_id: str) -> None:
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast_to_case_managers(self, message: dict) -> None:
        """Broadcast a message to all case managers."""
        disconnected = []
        for connection in self.case_manager_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect_case_manager(conn)

    async def broadcast_alert(self, alert: dict) -> None:
        """
        Broadcast an alert to relevant parties.

        - Send to the user
        - Send to case managers
        - Send to family members (if configured)
        """
        user_id = alert.get("user_id")

        # Format alert message
        message = {
            "type": "alert",
            "alert": alert,
            "timestamp": datetime.now().isoformat(),
        }

        # Send to case managers
        await self.broadcast_to_case_managers(message)

        # Send to user (if they have a connection)
        if user_id:
            await self.send_personal_message(message, user_id)

        logger.info(
            "Alert broadcasted",
            alert_type=alert.get("alert_type"),
            user_id=user_id,
        )

    def get_stats(self) -> dict:
        """Get connection statistics."""
        return {
            "connected_users": len(self.active_connections),
            "total_user_connections": sum(
                len(conns) for conns in self.active_connections.values()
            ),
            "case_manager_connections": len(self.case_manager_connections),
        }


# Global connection manager
manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get the global connection manager."""
    return manager


# ===========================================
# WebSocket Endpoints
# ===========================================

@router.websocket("/ws/user/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for user-specific updates.

    Receives:
    - Personal alerts
    - Conversation updates
    - Booking status changes
    """
    await manager.connect(websocket, user_id)
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "מחובר לשירות ההתראות",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
        })

        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0  # 30 second timeout for ping/pong
                )

                message = json.loads(data)

                # Handle ping
                if message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat(),
                    })

            except asyncio.TimeoutError:
                # Send keepalive
                await websocket.send_json({
                    "type": "keepalive",
                    "timestamp": datetime.now().isoformat(),
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error("WebSocket error", error=str(e), user_id=user_id)
        manager.disconnect(websocket, user_id)


@router.websocket("/ws/case-manager")
async def websocket_case_manager_endpoint(
    websocket: WebSocket,
    token: str = Query(None),
):
    """
    WebSocket endpoint for case managers.

    Receives:
    - All client alerts
    - Booking status changes
    - Health anomalies
    """
    # For demo, skip token verification
    # In production: verify token and check role

    await manager.connect_case_manager(websocket)
    try:
        # Send welcome message with current alerts
        mock_provider = get_mock_provider()
        pending_alerts = [a for a in mock_provider.get_alerts() if a["status"] == "pending"]

        await websocket.send_json({
            "type": "connected",
            "message": "מחובר לשירות התראות מנהלי מקרה",
            "pending_alerts_count": len(pending_alerts),
            "timestamp": datetime.now().isoformat(),
        })

        # Keep connection alive
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )

                message = json.loads(data)

                if message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat(),
                    })

                elif message.get("type") == "get_alerts":
                    # Return current alerts
                    alerts = mock_provider.get_alerts()
                    await websocket.send_json({
                        "type": "alerts_list",
                        "alerts": alerts,
                        "timestamp": datetime.now().isoformat(),
                    })

            except asyncio.TimeoutError:
                await websocket.send_json({
                    "type": "keepalive",
                    "timestamp": datetime.now().isoformat(),
                })

    except WebSocketDisconnect:
        manager.disconnect_case_manager(websocket)
    except Exception as e:
        logger.error("Case manager WebSocket error", error=str(e))
        manager.disconnect_case_manager(websocket)


# ===========================================
# HTTP Endpoints for Testing
# ===========================================

@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics."""
    return {
        "success": True,
        "data": manager.get_stats(),
    }


@router.post("/ws/test-alert")
async def send_test_alert(
    user_id: str = "user-sarah",
    alert_type: str = "health",
    severity: str = "medium",
    title: str = "התראת בדיקה",
):
    """
    Send a test alert via WebSocket.

    Useful for testing the alert system.
    """
    alert = {
        "alert_id": f"test-alert-{datetime.now().timestamp()}",
        "user_id": user_id,
        "alert_type": alert_type,
        "severity": severity,
        "title": title,
        "description": "זוהי התראת בדיקה לבדיקת מערכת ה-WebSocket",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }

    await manager.broadcast_alert(alert)

    return {
        "success": True,
        "message": "Alert sent",
        "alert": alert,
        "stats": manager.get_stats(),
    }
