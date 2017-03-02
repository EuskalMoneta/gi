from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'operations/index.html')


@login_required
def entrees_euro(request):
    return render(request, 'operations/entrees_euro.html')


@login_required
def entrees_eusko(request):
    return render(request, 'operations/entrees_eusko.html')


@login_required
def reconversions(request):
    return render(request, 'operations/reconversions.html')


@login_required
def depots_retraits(request):
    return render(request, 'operations/depots_retraits.html')


@login_required
def changes_prelevement(request):
    return render(request, 'operations/changes-prelevement.html')
