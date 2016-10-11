from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'bdc/index.html')


@login_required
def add(request):
    return render(request, 'bdc/add.html')


@login_required
def show(request, bdc_id):
    return render(request, 'bdc/show.html', {'bdc_id': bdc_id})


@login_required
def history(request, account_name, bdc_id):
    return render(request, 'bdc/history.html', {'account_name': account_name, 'bdc_id': bdc_id})


@login_required
def entree_stock(request, bdc_id):
    return render(request, 'bdc/entree-stock.html', {'bdc_id': bdc_id})


@login_required
def sortie_stock(request, bdc_id):
    return render(request, 'bdc/sortie-stock.html', {'bdc_id': bdc_id})


@login_required
def bank_deposit(request, bdc_id):
    return render(request, 'bdc/bank-deposit.html', {'bdc_id': bdc_id})


@login_required
def cash_deposit(request, bdc_id):
    return render(request, 'bdc/cash-deposit.html', {'bdc_id': bdc_id})
