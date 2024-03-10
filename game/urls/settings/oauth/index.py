from django.urls import path
from game.views.settings.oauth.acwing_web.apply_code import apply_code as web_apply_code
from game.views.settings.oauth.acwing_web.receive_code import receive_code as web_receive_code
from game.views.settings.oauth.acwing_acapp.apply_code import apply_code as acapp_apply_code
from game.views.settings.oauth.acwing_acapp.receive_code import receive_code as acapp_receive_code

urlpatterns = [
    path("acwing_web/apply_code/", web_apply_code),
    path("acwing_web/receive_code/", web_receive_code),
    path("acwing_acapp/apply_code/", acapp_apply_code),
    path("acwing_acapp/receive_code/", acapp_receive_code)
]