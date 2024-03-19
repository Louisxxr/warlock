from django.urls import path
from game.consumers.multi_mode.index import MultiPlayer

websocket_urlpatterns = [
    path("wss/multi_mode/", MultiPlayer.as_asgi(), name = "wss_multi_mode")
]
