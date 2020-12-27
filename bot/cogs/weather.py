import aiohttp
import asyncio
import config
import datetime
import discord
from discord.ext import commands
from dotmap import DotMap
import json
import os

class Weather(commands.Cog):

    DAYS=["Mon","Tues","Wed","Thur","Fri","Sat","Sun"]

    def __init__(self, bot, url, api_key):
        self.bot = bot
        self.root_url = url
        self.api_key = api_key
        self.headers = {
            'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
            'x-rapidapi-key': f"{self.api_key}"
        }

    @staticmethod
    def get_emote_for_code(code):
        # thunder
        if code >= 200 and code < 300:
          return "🌩" 

        # drizzle
        if code >= 300 and code < 400:
            return "💦"

        # rain
        if code >= 500 and code < 600:
            return "🌧"

        # snow
        if code >= 600 and code < 700:
            return "❄"

        # smoke
        if code == 711:
            return "🌁"

        # fog
        if code == 762:
            return "🌁"

        # volcano
        if code == 762:
            return ":volcano:"

        # tornado
        if code == 781:
            return "🌪"

        # clear
        if code == 800:
            return "☀"

        # cloudy
        if code >= 801 and code < 805:
            return "☁"

        return ""

    @staticmethod
    def getDescription(weather):
        return weather['description'].capitalize()

    @staticmethod
    async def fetch_data(url, headers, params):
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, params=params) as response:
                content = await response.text()
                return DotMap(json.loads(content))

    @staticmethod
    def render_current(data):
        title = f"Current weather for {data.name}"
        description = f"{Weather.get_emote_for_code(data.weather[0].id)} {Weather.getDescription(data.weather[0])}"
        embed = discord.Embed(title=title, description=description)
        embed.set_thumbnail(url=f"http://openweathermap.org/img/w/{data.weather[0].icon}.png")
        embed.add_field(name="Current", value=f"{round(data.main.temp)}f", inline=True)
        embed.add_field(name="Feels like", value=f"{round(data['main']['feels_like'])}f", inline=True)
        embed.add_field(name="Humidity", value=f"{data.main.humidity}%", inline=True)
        embed.add_field(name="Low", value=f"{data.main.temp_min}f", inline=True)
        embed.add_field(name="High", value=f"{data.main.temp_max}f", inline=True)
        return embed

    @staticmethod
    def render_forecast(data):
        title = f"{data.cnt} day forecast for {data.city.name}"
        embed = discord.Embed(title=title)
        embed.set_thumbnail(url=f"{config.images_url}/weather.png")
        for entry in data.list:
            dt = datetime.datetime.fromtimestamp(entry.dt)
            low = f"{round(entry.temp.min)}f"
            high = f"{round(entry.temp.max)}f"
            humidity = f"{entry.humidity}%"
            desc = f"{Weather.get_emote_for_code(entry.weather[0].id)} {entry.weather[0].main}"
            embed.add_field(name=f"{Weather.DAYS[dt.weekday()]}: {dt.month}/{dt.day}", value=f"{desc}\nLow: {low}\nHigh: {high}\nHumidity: {humidity}")
        return embed

    @commands.command(name="weather")
    async def get_weather(self, ctx, *, location:str):
        url = self.root_url + "/weather"
        params = {"units": "imperial"}

        if location.isnumeric():
            params["zip"] = location
        else:
            params["q"] = location

        data = await self.fetch_data(url, self.headers, params)
        if data.cod == 200:
            msg = Weather.render_current(data)
            await ctx.send(embed=msg)
        else:
            msg = data.message.capitalize()
            await ctx.send(msg)

    @commands.command(name="forecast")
    async def get_forecast(self, ctx, *, location:str):
        url = self.root_url + "/forecast/daily"
        params = {"units": "imperial"}

        if location.isnumeric():
            params["zip"] = location
        else:
            params["q"] = location

        data = await self.fetch_data(url, self.headers, params)
        if data.cod == "200":
            msg = Weather.render_forecast(data)
            await ctx.send(embed=msg)
        else:
            msg = data.message.capitalize()
            await ctx.send(msg)

def setup(bot):
    url = os.getenv("WEATHER_API_URL")
    api_key = os.getenv("RAPIDAPI_KEY")
    bot.add_cog(Weather(bot, url, api_key))