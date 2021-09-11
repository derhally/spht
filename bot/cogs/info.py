import asyncio

import discord
from discord.ext import commands


class Info(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ping")
    async def ping(self, ctx):
        await ctx.send(f"Latency: {round(self.bot.latency * 1000)}ms.")

    @commands.guild_only()
    @commands.command()
    async def userinfo(self, ctx, user: discord.Member=None):
        """Gives information about the specified used. If a user was not specified, the user will be the command author."""
        user = user or ctx.author
        roles = [role for role in user.roles]
        embed=discord.Embed(color=0x80ffff)
        embed.set_author(name=user.name, icon_url=user.avatar_url)
        embed.set_thumbnail(url=user.avatar_url)
        embed.add_field(name="Status", value=user.status, inline=True)
        embed.add_field(name="Activity", value=(user.activity.name if user.activity else "n/a"), inline=True)
        embed.add_field(name="Joined at", value=user.joined_at, inline=True)
        embed.add_field(name="Account Registered", value=user.created_at, inline=True)
        embed.add_field(name="Roles [{}]".format(len(user.roles)), value=" ".join([role.mention for role in roles]), inline=True)
        await ctx.send(embed=embed)
    
    @commands.guild_only()
    @commands.command()
    async def guildinfo(self, ctx):
        """Gives information of the guild the command was run on."""
        guild = ctx.guild
        roles = [role for role in guild.roles]
        embed=discord.Embed(color=0x80ffff)
        embed.set_author(name=guild.name, icon_url=guild.icon_url)
        embed.set_thumbnail(url=guild.icon_url)
        embed.add_field(name="Owner", value=guild.owner, inline=True)
        embed.add_field(name="Server Region", value=guild.region, inline=True)
        embed.add_field(name="Categories", value=len(guild.categories), inline=True)
        embed.add_field(name="Text Channels", value=len(guild.text_channels), inline=True)
        embed.add_field(name="Voice Channels", value=len(guild.voice_channels), inline=True)
        embed.add_field(name="Members", value=len(guild.members), inline=True)
        embed.add_field(name="Guild ID", value=guild.id, inline=True)
        embed.add_field(name="Created at", value=guild.created_at, inline=True)
        embed.add_field(name="Roles [{}]".format(len(guild.roles)), value=" ".join([role.mention for role in roles]), inline=True)
        embed.add_field(name="Shard ID", value=guild.shard_id, inline=True)
        await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(Info(bot))
