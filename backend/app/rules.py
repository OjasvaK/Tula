import re

import yaml


def load_rules(path="app/rules.yaml") -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


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
