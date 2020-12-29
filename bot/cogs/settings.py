import asyncio
import discord
from discord.ext import commands
import shlex

settings_to_cogs = {}

class SettingsKey:
    def __init__(self, key):
        self.key = key.lower()

    def __call__(self, cls):
        settings_to_cogs[self.key] = cls.__name__
        return cls

class Settings(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(hidden=True)
    async def setting(self, ctx, *, msg):
        args = shlex.split(msg)
        setting_category = args[0].lower()
        if setting_category in settings_to_cogs:
            cog = settings_to_cogs[setting_category]
            cog = self.bot.get_cog(cog)
            if cog:
                await cog.save_user_pref(ctx, args[0], args[1:])

def setup(bot):
    bot.add_cog(Settings(bot))