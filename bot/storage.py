import config
from jsonstore import JsonStore
import threading

class Storage:
    def init_store(self):
        if "user" not in self.store:
            self.store["user"] = {}

        if "global" not in self.store:
            self.store["global"] = {}

    def __init__(self):
        self._lock = threading.Lock()
        self.store = JsonStore(config.config_path, indent=2, auto_commit=True)
        self.init_store()

    def get(self, setting, user_id = None, default=None):
        try:
            root = f"user.{user_id}" if user_id else "global"
            with self._lock:
                return self.store[f"{root}.{setting}"]
        except:
            return default

    def set(self, setting:str, value, user_id:str = None):
        with self._lock:
            if user_id: 
                if str(user_id) not in self.store.user:
                    self.store["user", str(user_id)] = {}
                root_obj = self.store["user", str(user_id)]
                root_path = f"user.{user_id}"
            else:
                root_obj = self.store["global"]
                root_path = "global"

            obj = root_obj
            parts = str(setting).split(".")
            for part in parts[:-1]:
                if part in obj:
                    obj = obj[part]
                else:
                    obj[part] = {}
                    obj = obj[part]

            obj[parts[-1]] = value
            self.store[root_path] = root_obj 