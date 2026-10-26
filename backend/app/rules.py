import re

import yaml


def load_rules(path="app/rules.yaml") -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def rule_metadata(rules: dict) -> list[dict]:
    """Flatten the parsed rules.yaml into a list of {field, description,
    legal_reference} dicts for the /rules endpoint and the listing-detail view."""
    return [
        {
            "field": field,
            "description": rule["description"],
            "legal_reference": rule["legal_reference"],
        }
        for field, rule in rules.items()
    ]


def check_compliance(text: str, rules: dict) -> dict:
    text_lower = text.lower()
    results = {}
    for field, rule in rules.items():
        match = re.search(rule["pattern"], text_lower, re.IGNORECASE)
        results[field] = {
            "present": bool(match),
            "matched_text": match.group(0) if match else None,
            "legal_reference": rule["legal_reference"],
        }
    return results
