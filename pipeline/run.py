#!/usr/bin/env python3
"""Entry point for the AI Pulse news pipeline."""
import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))

from pipeline import Pipeline


async def main():
    config_path = os.environ.get("CONFIG_PATH")
    pipeline = Pipeline(config_path=config_path)
    await pipeline.run()


if __name__ == "__main__":
    asyncio.run(main())
