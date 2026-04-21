"""
Database schema management for multi-schema PostgreSQL setup.

Supports three schemas:
- shared: Cross-service data (users, family_members)
- ai_agent: AI Agent specific tables
- marketplace: Marketplace specific tables
"""

from enum import Enum
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class Schema(str, Enum):
    """Database schemas."""

    SHARED = "shared"
    AI_AGENT = "ai_agent"
    MARKETPLACE = "marketplace"


async def create_schemas(session: AsyncSession) -> None:
    """Create all database schemas if they don't exist."""
    for schema in Schema:
        await session.execute(
            text(f"CREATE SCHEMA IF NOT EXISTS {schema.value}")
        )
    await session.commit()


async def drop_schemas(session: AsyncSession) -> None:
    """Drop all database schemas (for testing)."""
    for schema in Schema:
        await session.execute(
            text(f"DROP SCHEMA IF EXISTS {schema.value} CASCADE")
        )
    await session.commit()


async def set_search_path(session: AsyncSession, *schemas: Schema) -> None:
    """
    Set the search path for the current session.

    This determines the order in which schemas are searched when
    an unqualified table name is used.
    """
    schema_names = ",".join(s.value for s in schemas)
    await session.execute(text(f"SET search_path TO {schema_names}"))


def get_table_name(table: str, schema: Schema) -> str:
    """Get fully qualified table name with schema."""
    return f"{schema.value}.{table}"


async def table_exists(
    session: AsyncSession,
    table_name: str,
    schema: Schema,
) -> bool:
    """Check if a table exists in the specified schema."""
    result = await session.execute(
        text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = :schema
                AND table_name = :table
            )
        """),
        {"schema": schema.value, "table": table_name},
    )
    return result.scalar() or False


async def get_table_columns(
    session: AsyncSession,
    table_name: str,
    schema: Schema,
) -> list[dict[str, Any]]:
    """Get column information for a table."""
    result = await session.execute(
        text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = :schema
            AND table_name = :table
            ORDER BY ordinal_position
        """),
        {"schema": schema.value, "table": table_name},
    )

    return [
        {
            "name": row.column_name,
            "type": row.data_type,
            "nullable": row.is_nullable == "YES",
            "default": row.column_default,
        }
        for row in result
    ]
