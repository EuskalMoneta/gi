from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'coffre/index.html')


@login_required
def sortie(request):
    return render(request, 'coffre/sortie.html')
