"""Deterministic seeds: SHA-1 of a slash-joined key read as an integer. No clock, no unordered iteration."""
import hashlib
import random


def seed_for(*parts):
    key = "/".join(str(p) for p in parts)
    return int(hashlib.sha1(key.encode("utf-8")).hexdigest(), 16)


def rng(*parts):
    return random.Random(seed_for(*parts))


def unit(*parts):
    """A stable float in [0, 1) for a key."""
    return (seed_for(*parts) % (1 << 53)) / float(1 << 53)


def short_hash(obj, n=16):
    """Hash of any json-able value (sorted keys), used for manifests and intent hashes."""
    import json
    return hashlib.sha1(json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()[:n]
