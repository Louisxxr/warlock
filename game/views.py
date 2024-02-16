from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">WARLOCK</h1>'
    line2 = '<img src="https://c-ssl.duitang.com/uploads/item/201408/18/20140818131405_FFSPC.jpeg">'
    return HttpResponse(line1 + line2)

