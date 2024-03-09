from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.players.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get("code")
    state = data.get("state")
    if not cache.has_key(state):
        return redirect("root")
    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        "appid": "6621",
        "secret": "e12723908fd34732abadcb6f88cb6a71",
        "code": code
    }
    access_token_resp = requests.get(apply_access_token_url, params = params).json()

    access_token = access_token_resp["access_token"]
    openid = access_token_resp["openid"]
    player = Player.objects.filter(openid = openid)
    if player.exists():
        login(request, player[0].user)
        return redirect("root")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_resp = requests.get(get_userinfo_url, params = params).json()

    username = userinfo_resp["username"]
    photo = userinfo_resp["photo"]
    while User.objects.filter(username = username).exists(): # 若第三方平台用户名与已有用户名重名，则随机添加后缀指派用户名
        username += str(randint(0, 9))
    user = User(username = username)
    user.save()
    Player.objects.create(user = user, photo = photo, openid = openid)
    login(request, user)
    return redirect("root")