#!/usr/bin/env python3
"""Structural acceptance tests for the N.U Generation 1 default pack manifest."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
manifest = json.loads((ROOT / "NU-GEN1-PACK-MANIFEST.json").read_text(encoding="utf-8"))

assert manifest["format"] == "NUPACK-MANIFEST/1"
assert manifest["product"] == "N.U"
assert manifest["generation"] == 1
policy = manifest["install_policy"]
assert policy["default_enabled"] is True
assert policy["user_may_uninstall"] is True
assert policy["uninstall_requires_confirmation"] is True
assert policy["preserve_user_saves"] is True
assert policy["reinstall_supported"] is True

entries = manifest["entries"]
expected = {
    "nu.gen1.bubble-hunt": "Bubble Hunt",
    "nu.gen1.mana-collector": "Mana Collector",
    "nu.gen1.chaos-attack": "Chaos Attack",
}
assert len(entries) == len(expected), "Unexpected number of Generation 1 pack entries"
by_id = {entry["id"]: entry for entry in entries}
assert len(by_id) == len(entries), "Duplicate package ID"
assert set(by_id) == set(expected), "Generation 1 pack IDs differ from approved set"
for package_id, title in expected.items():
    entry = by_id[package_id]
    assert entry["title"] == title
    assert entry["kind"] == "game"
    assert entry["default_enabled"] is True
    assert entry["source_binding"] == "pending"
    assert entry["package_state"] == "not-yet-bound"

integrity = manifest["integrity"]
assert integrity["algorithm"] == "SHA-256"
assert integrity["signature_required_for_release"] is True

print("PASS: Generation 1 pack manifest structure and owner policy")
print("NOTE: Payload binding and runtime install/uninstall are not tested by this structural test.")
