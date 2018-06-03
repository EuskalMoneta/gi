"""gi URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

from django.conf.urls import url
from django.contrib.auth.views import logout
from django.core.urlresolvers import reverse_lazy

from base import views as base_views
from bureauxdechange import views as bdc_views
from coffre import views as coffre_views
from comptesenbanque import views as comptes_views
from operationsatraiter import views as operations_views
from gi.auth import login_view

urlpatterns = [
    # built-in Django i18n:
    # from django.conf.urls import include, i18n
    # url(r'^i18n/', include(i18n)),
    url(r'^i18n/setlang_custom/$', base_views.setlang_custom, name='setlang_custom'),

    # JavaScript config for this Django/React app
    url(r'^config\.js$', base_views.config_js, name='config_js'),
    # login
    url(r'^login/?$', login_view, name='login'),
    # logout
    url(r'^logout/?$', logout, {'next_page': reverse_lazy('home')}, name='logout'),
    url(r'^logout/(?P<next_page>[\w\-]+)/?$', logout, name='logout'),
    # change-password
    url(r'^change-password/?$', base_views.change_password, name='change-password'),

    # coffre
    url(r'^coffre/?$', coffre_views.index, name='coffre-home'),
    url(r'^coffre/entree/?$', base_views.generic_history_validation, name='coffre-entree'),
    url(r'^coffre/sortie/?$', coffre_views.sortie, name='coffre-sortie'),

    # bdc
    url(r'^bdc/?$', bdc_views.index, name='bdc-home'),
    url(r'^bdc/add/?$', bdc_views.add, name='bdc-add'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/?$', bdc_views.show, name='bdc-show'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/history/(?P<account_name>[\w\-]+)/?$',
        bdc_views.history, name='manager-history'),

    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/entree-stock/?$', bdc_views.entree_stock, name='entree-stock'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/sortie-stock/?$', bdc_views.sortie_stock, name='sortie-stock'),

    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/bank-deposit/?$', bdc_views.bank_deposit, name='bank-deposit'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/cash-deposit/?$', bdc_views.cash_deposit, name='cash-deposit'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/sortie-caisse-eusko/?$', bdc_views.cash_deposit, name='sortie-caisse-eusko'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/sortie-retour-eusko/?$', bdc_views.cash_deposit, name='sortie-retour-eusko'),

    # comptesenbanque
    url(r'^comptes/?$', comptes_views.index, name='comptes-home'),
    url(r'^banques/rapprochement/(?P<bank_name>[\w\-]+)?/?$',
        base_views.generic_history_validation, name='banques-rapprochement'),
    url(r'^banques/virement/(?P<bank_name>[\w\-]+)?/?$',
        base_views.generic_history_validation, name='banques-virement'),

    # historiques
    url(r'^(?P<account_type>[\w\-]+)/history/?(?P<account_name>[\w\-]+)?/?$',
        base_views.history, name='generic-history'),

    # operations
    url(r'^operations/?$', operations_views.index, name='operations-home'),
    url(r'^operations/entrees-euro/?$', base_views.generic_history_validation, name='operations-entrees-euro'),
    url(r'^operations/entrees-eusko/?$', base_views.generic_history_validation, name='operations-entrees-eusko'),
    url(r'^operations/reconversions/?$', base_views.generic_history_validation, name='operations-reconversions'),
    url(r'^operations/depots-retraits/?$', base_views.generic_history_validation, name='operations-depots-retraits'),
    url(r'^operations/changes-prelevement/?$', operations_views.changes_prelevement, name='operations-changes-prelevement'),
    url(r'^operations/change-virement/?$', operations_views.change_virement, name='operations-change-virement'),
    url(r'^operations/dons-3-pourcent/?$', operations_views.dons_3_pourcent, name='operations-dons-3-pourcent'),
    url(r'^operations/export-vers-odoo/$', operations_views.export_vers_odoo, name='operations-export-vers-odoo'),

    # home
    url(r'^$', bdc_views.index, name='home'),
]
