from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "6621"
    redirect_uri = quote("https://app6621.acapp.acwing.com.cn/settings/oauth/acwing_web/receive_code")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200) # 有效期：2h

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        "result": "success",
        "apply_code_url": apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })