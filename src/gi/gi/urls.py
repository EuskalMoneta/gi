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
    # change-password
    url(r'^change-password/?$', base_views.change_password, name='change-password'),

    # coffre
    url(r'^coffre/?$', coffre_views.index, name='coffre-home'),
    # url(r'^coffre/entree/?$', coffre_views.entree, name='coffre-entree'),
    url(r'^coffre/sortie/?$', coffre_views.sortie, name='coffre-sortie'),

    # bdc
    url(r'^bdc/?$', bdc_views.index, name='bdc-home'),
    url(r'^bdc/add/?$', bdc_views.add, name='bdc-add'),
    url(r'^bdc/manage/(?P<bdc_id>[\w\-]+)/?$', bdc_views.show, name='bdc-show'),

    # comptesenbanque
    url(r'^comptes/?$', comptes_views.index, name='comptes-home'),

    # operations
    url(r'^operations/?$', operations_views.index, name='operations-home'),
    # url(r'^operations/entrees-euro/?$', operations_views.entrees_euro, name='operations-entrees-euro'),
    # url(r'^operations/entrees-eusko/?$', operations_views.entrees_eusko, name='operations-entrees-eusko'),
    # url(r'^operations/reconversions/?$', operations_views.reconversions, name='operations-reconversions'),
    # url(r'^operations/depots-retraits/?$', operations_views.depots_retraits, name='operations-depots-retraits'),

    # home
    url(r'^$', bdc_views.index, name='home'),
]
