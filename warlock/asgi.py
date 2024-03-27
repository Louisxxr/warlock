import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warlock.settings') # 环境变量设置语句应该尽量靠前
django.setup()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from game.routing import websocket_urlpatterns

from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
})