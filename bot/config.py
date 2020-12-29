import os

images_url = os.getenv("IMAGE_SERVER_URL")
cat_images_url = f"{images_url}/cats"
config_path = os.getenv("BOT_CONFIG_PATH")
bot_owner = os.getenv("BOT_OWNER")

def image_url(name):
    return f"{images_url}/{name}"
