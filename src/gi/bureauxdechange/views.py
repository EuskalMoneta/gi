from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'bdc/index.html')


@login_required
def show(request, bdc_id):
    return render(request, 'bdc/show.html', {'bdc_id': bdc_id})
