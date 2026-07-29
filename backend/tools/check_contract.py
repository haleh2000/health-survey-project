"""Verify that the frontend's backend-contract.ts still matches this backend.

The scoring path resolves most answers with ``dict.get(value, 0)`` and plain
substring searches, so a reworded option does not raise anything — it just
scores as zero and the user is handed the wrong risk level. This script is the
guard against that: it re-reads the Persian strings out of models.py, enums.py
and config.py and diffs them against the ones the frontend compiled in.

Usage (no dependencies, no venv needed):

    python3 backend/tools/check_contract.py

Exits non-zero on any drift, so it can be wired into CI or a pre-commit hook.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
CONTRACT_TS = (
    BACKEND_DIR.parent
    / "frontend/src/modules/survey/infrastructure/contract/backend-contract.ts"
)


def read(name: str) -> str:
    return (BACKEND_DIR / name).read_text(encoding="utf-8")


def model_aliases(source: str, class_name: str, serialization: bool) -> dict[str, str]:
    """Pull ``Field(alias=...)`` / ``Field(serialization_alias=...)`` per class."""
    block = next(
        part for part in re.split(r"^class ", source, flags=re.M)[1:]
        if part.startswith(class_name)
    )
    pattern = (
        r'serialization_alias\s*=\s*"([^"]+)"'
        if serialization
        else r'(?<!serialization_)alias\s*=\s*"([^"]+)"'
    )

    found: dict[str, str] = {}
    for name, args in re.findall(
        r"^\s*(\w+)\s*:\s*[^=]+=\s*Field\((.*)\)\s*$", block, re.M
    ):
        match = re.search(pattern, args)
        if match:
            found[name] = match.group(1)
    return found


def enum_values(source: str) -> dict[str, dict[str, str]]:
    values: dict[str, dict[str, str]] = {}
    current = None
    for line in source.splitlines():
        header = re.match(r"class (\w+)\(", line)
        if header:
            current = header.group(1)
            values[current] = {}
        member = re.match(r'\s+(\w+)\s*=\s*"([^"]+)"', line)
        if member and current:
            values[current][member.group(1)] = member.group(2)
    return values


def dict_keys(source: str, name: str) -> list[str]:
    body = re.search(name + r"\s*=\s*\{(.*?)\}", source, re.S)
    if not body:
        return []
    return re.findall(r"'([^']+)'\s*:", body.group(1))


def ts_strings(ts: str, block_name: str) -> set[str]:
    """Every double-quoted string inside a top-level ``export const`` block."""
    match = re.search(
        rf"export const {block_name}[^=]*=\s*(\{{.*?\n\}})", ts, re.S
    )
    if not match:
        return set()
    return set(re.findall(r'"((?:[^"\\]|\\.)*)"', match.group(1)))


def main() -> int:
    if not CONTRACT_TS.exists():
        print(f"contract file not found: {CONTRACT_TS}", file=sys.stderr)
        return 2

    ts = CONTRACT_TS.read_text(encoding="utf-8")
    models = read("models.py")
    enums = read("enums.py")
    config = read("config.py")

    problems: list[str] = []

    def compare(label: str, expected: set[str], block: str) -> None:
        actual = ts_strings(ts, block)
        for value in sorted(expected - actual):
            problems.append(f"{label}: {json.dumps(value, ensure_ascii=False)} is missing from {block}")

    compare(
        "request alias",
        set(model_aliases(models, "SurveyInput", serialization=False).values()),
        "REQUEST_FIELD_ALIAS",
    )
    compare(
        "response alias",
        set(model_aliases(models, "RiskResponse", serialization=True).values()),
        "RESPONSE_FIELD_ALIAS",
    )

    accepted = {
        value
        for members in enum_values(enums).values()
        for value in members.values()
    }
    accepted.update(dict_keys(config, "CIGARETTE_MAP"))
    compare("accepted value", accepted, "BACKEND_VALUE")

    keywords = dict(re.findall(r"^(\w*KEYWORD)\s*=\s*'([^']+)'", config, re.M))
    compare("keyword", set(keywords.values()), "BACKEND_KEYWORD")

    labels = dict(re.findall(r"^(RISK_LEVEL\w*)\s*=\s*'([^']+)'", config, re.M))
    compare("risk label", set(labels.values()), "RISK_LEVEL_LABEL")

    if problems:
        print("Contract drift between the backend and the frontend:\n")
        for problem in problems:
            print(f"  - {problem}")
        print(
            "\nUpdate frontend/src/modules/survey/infrastructure/contract/"
            "backend-contract.ts, and check whether the UI wording in "
            "definition/ and mappers/backend-value.map.ts needs to follow."
        )
        return 1

    print("Contract is in sync with the frontend.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
