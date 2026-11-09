#!/usr/bin/env python3
"""Create local secrets once; never print them or overwrite an existing .env."""
from pathlib import Path
import os
import secrets

root = Path(__file__).resolve().parent.parent
destination = root / ".env"
if destination.exists():
    print("Existing .env retained.")
else:
    content = (root / ".env.example").read_text()
    for name in ("bootstrap", "product", "ai", "redis"):
        content = content.replace(f"change-local-{name}-password", secrets.token_hex(24))
    with open(destination, "x", opener=lambda path, flags: os.open(path, flags, 0o600)) as stream:
        stream.write(content)
    print("Created private .env with local development secrets.")
