from django.urls import path

from . import views

urlpatterns = [
    path('', views.top_n, name='index'),
    path('<int:year>', views.top_n, name="scores for year"),
    path('<int:year>/<int:month>', views.top_n, name="scores for month"),
    path('<int:year>/<int:month>/<int:day>', views.top_n, name="scores for day"),
    path('<str:name>', views.scores_name, name="scores for name"),
]