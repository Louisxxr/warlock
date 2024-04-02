from django.urls import path, include
from game.views.settings.getinfo import InfoView
from game.views.settings.register import RegisterView
from game.views.settings.ranklist import RanklistView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("getinfo/", InfoView.as_view(), name = "settings_getinfo"),
    path("token/", TokenObtainPairView.as_view(), name = "settings_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name = "settings_token_refresh"),
    path("register/", RegisterView.as_view(), name = "settings_register"),
    path("oauth/", include("game.urls.settings.oauth.index")),
    path("ranklist/", RanklistView.as_view(), name = "settings_ranklist")
]
