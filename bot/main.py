from bot import Bot
import os

modules = ["modules.bonghit", "modules.weather", "modules.stocks"]

token = os.getenv("BOT_TOKEN")
client = Bot(token=token, command_prefix="!", modules=modules)
client.run(token)