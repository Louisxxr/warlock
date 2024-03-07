from django.http import JsonResponse
from django.contrib.auth import logout

def logout_(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            "result": "success"
        })
    logout(request)
    return JsonResponse({
        "result": "success"
    })