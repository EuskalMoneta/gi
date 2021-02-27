from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'operations/index.html')


@login_required
def changes_prelevement(request):
    return render(request, 'operations/changes-prelevement.html')


@login_required
def change_virement(request):
    return render(request, 'operations/change-virement.html')


@login_required
def resilier_adherent(request):
    return render(request, 'operations/resilier-adherent.html')


@login_required
def dons_3_pourcent(request):
    return render(request, 'operations/dons-3-pourcent.html')


@login_required
def export_vers_odoo(request):
    return render(request, 'operations/export-vers-odoo.html')
