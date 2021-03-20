from bot import Bot
import os
import sys


modules = [
    "cogs.settings",
    "cogs.bonghit",
    "cogs.cat",
    "cogs.crypto",
    "cogs.info",
    "cogs.stocks",
    "cogs.weather",
    "cogs.wolfram"
]

token = os.getenv("BOT_TOKEN")
prefix = os.getenv("BOT_COMMAND_PREFIX")
client = Bot(token=token, command_prefix=prefix, modules=modules)
client.run(token)
