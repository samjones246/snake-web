from django.urls import path

from . import views

urlpatterns = [
    path('', views.retrieve, name='index'),
    path('<int:year>', views.retrieve, name="scores for year"),
    path('<int:year>/<int:month>', views.retrieve, name="scores for month"),
    path('<int:year>/<int:month>/<int:day>', views.retrieve, name="scores for day"),
    path('submit', views.submit, name="submit score"),
    path('rank/<str:period>', views.rank, name="get user rank")
]