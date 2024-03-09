from django.urls import path, include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import login_
from game.views.settings.logout import logout_
from game.views.settings.register import register

urlpatterns = [
    path("getinfo/", getinfo, name = "settings_getinfo"),
    path("login/", login_, name = "settings_login"),
    path("logout/", logout_, name = "settings_logout"),
    path("register/", register, name = "settings_register"),
    path("oauth/", include("game.urls.settings.oauth.index"))
]
