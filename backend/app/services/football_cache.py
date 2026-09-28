"""In-process TTL cache retaining the last successful response."""
from copy import deepcopy
from threading import Lock
from time import monotonic

_items = {}
_lock = Lock()


def get(key, allow_stale=False):
    with _lock:
        item = _items.get(key)
        return deepcopy(item[1]) if item and (allow_stale or item[0] > monotonic()) else None


def put(key, value, ttl_seconds):
    with _lock:
        _items[key] = (monotonic() + ttl_seconds, deepcopy(value))


def clear():
    with _lock:
        _items.clear()
