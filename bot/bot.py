import discord
from discord.ext import commands
import sys

class Bot(commands.Bot):
    
    def __init__(self, token, command_prefix, modules):
        commands.Bot.__init__(self, command_prefix=command_prefix)
        self.modules = modules
        self.load()
        self.run(token, bot=True, reconnect=True)

    def load(self):
        for module in self.modules:
            try:
                self.load_extension(module)
            except Exception as e:
                print(f"<!> Error loading module '{module}'.\n{type(e).__name__}: {e}", file=sys.stderr)
            else:
                print(f"<!> Loaded {module}.")

    async def on_connect(self):
        print("Connected")

    async def on_ready(self):
        print("Logged on as {0}!".format(self.user))

    # async def on_message(self, message):
    #     if self.from_self(message):
    #         return

    #     print("Message from {0.author}: {0.content}".format(message))

    #     if message.content.startswith("!hello"):
    #         await message.channel.send("Hello!")
    
    def from_self(self, message):
        return message.author == self.user

