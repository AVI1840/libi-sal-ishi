"""
Alembic migration utilities.
"""

from pathlib import Path
from typing import Any

from alembic import command
from alembic.config import Config as AlembicConfig


def get_alembic_config(
    migrations_path: Path | str,
    database_url: str,
) -> AlembicConfig:
    """
    Create an Alembic configuration object.

    Args:
        migrations_path: Path to the migrations directory
        database_url: Database connection URL

    Returns:
        Alembic Config object
    """
    migrations_path = Path(migrations_path)

    alembic_cfg = AlembicConfig()
    alembic_cfg.set_main_option("script_location", str(migrations_path))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)

    return alembic_cfg


def run_migrations(
    migrations_path: Path | str,
    database_url: str,
    revision: str = "head",
) -> None:
    """
    Run database migrations up to the specified revision.

    Args:
        migrations_path: Path to the migrations directory
        database_url: Database connection URL
        revision: Target revision (default: "head" for latest)
    """
    config = get_alembic_config(migrations_path, database_url)
    command.upgrade(config, revision)


def rollback_migration(
    migrations_path: Path | str,
    database_url: str,
    revision: str = "-1",
) -> None:
    """
    Rollback database migrations.

    Args:
        migrations_path: Path to the migrations directory
        database_url: Database connection URL
        revision: Target revision (default: "-1" for one step back)
    """
    config = get_alembic_config(migrations_path, database_url)
    command.downgrade(config, revision)


def create_migration(
    migrations_path: Path | str,
    database_url: str,
    message: str,
    autogenerate: bool = True,
) -> None:
    """
    Create a new migration file.

    Args:
        migrations_path: Path to the migrations directory
        database_url: Database connection URL
        message: Migration message/description
        autogenerate: Whether to autogenerate from model changes
    """
    config = get_alembic_config(migrations_path, database_url)
    command.revision(config, message=message, autogenerate=autogenerate)


def get_current_revision(
    migrations_path: Path | str,
    database_url: str,
) -> str | None:
    """
    Get the current migration revision.

    Args:
        migrations_path: Path to the migrations directory
        database_url: Database connection URL

    Returns:
        Current revision ID or None
    """
    config = get_alembic_config(migrations_path, database_url)

    # This is a bit hacky but Alembic doesn't have a clean API for this
    from alembic.script import ScriptDirectory
    from alembic.runtime.migration import MigrationContext
    from sqlalchemy import create_engine

    engine = create_engine(database_url)
    script = ScriptDirectory.from_config(config)

    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        return context.get_current_revision()


def get_migration_history(
    migrations_path: Path | str,
) -> list[dict[str, Any]]:
    """
    Get all available migrations.

    Args:
        migrations_path: Path to the migrations directory

    Returns:
        List of migration info dictionaries
    """
    config = get_alembic_config(migrations_path, "")

    from alembic.script import ScriptDirectory
    script = ScriptDirectory.from_config(config)

    revisions = []
    for revision in script.walk_revisions():
        revisions.append({
            "revision": revision.revision,
            "down_revision": revision.down_revision,
            "message": revision.doc,
            "branch_labels": revision.branch_labels,
        })

    return revisions
