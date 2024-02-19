from django.shortcuts import render

def index(request):
    return render(request, "multi_ends/web.html")