import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _sync_tables_to_models() -> None:
    """Bring an existing database in line with the models.

    `create_all` only creates what is missing — it never alters a table that
    already exists, so a database created by an older revision keeps columns
    the models no longer have, misses ones the models gained, and can be
    stricter than the models about NULL. Every query touching such a column
    then fails.

    Only additive / safe changes are made: a missing column is added when it
    is nullable or has a server default, and a column the model declares
    nullable is relaxed from NOT NULL. Anything else is reported so it can be
    migrated by hand.
    """

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    preparer = engine.dialect.identifier_preparer

    for table in Base.metadata.sorted_tables:
        if table.name not in existing_tables:
            continue

        db_columns = {
            column["name"]: column
            for column in inspector.get_columns(table.name)
        }
        table_name = preparer.quote(table.name)

        for column in table.columns:
            quoted_name = preparer.quote(column.name)
            column_type = column.type.compile(dialect=engine.dialect)

            if column.name not in db_columns:
                if not column.nullable and column.server_default is None:
                    print(
                        f"Table '{table.name}' is missing column "
                        f"'{column.name}', and it cannot be added "
                        "automatically (not nullable and no server default) "
                        "— migrate it by hand."
                    )
                    continue

                statement = (
                    f"ALTER TABLE {table_name} "
                    f"ADD COLUMN {quoted_name} {column_type}"
                )

                with engine.begin() as connection:
                    connection.execute(text(statement))

                print(f"Added missing column {table.name}.{column.name}.")
                continue

            if column.nullable and not db_columns[column.name]["nullable"]:
                statement = (
                    f"ALTER TABLE {table_name} "
                    f"MODIFY COLUMN {quoted_name} {column_type} NULL"
                )

                with engine.begin() as connection:
                    connection.execute(text(statement))

                print(
                    f"Made {table.name}.{column.name} nullable, as the model "
                    "expects."
                )


def init_db():
    from db_models import Person, SurveySubmission, RefreshToken  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _sync_tables_to_models()


def check_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Database connection successful!")
    except Exception as e:
        print("Database connection failed:")
        print(e)