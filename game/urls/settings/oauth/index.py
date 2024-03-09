from django.urls import path
from game.views.settings.oauth.acwing_web.apply_code import apply_code
from game.views.settings.oauth.acwing_web.receive_code import receive_code

urlpatterns = [
    path("acwing_web/apply_code", apply_code),
    path("acwing_web/receive_code", receive_code)
]