from django.urls import path
from django.urls.conf import include

from . import views

urlpatterns = [
    path("", include("django.contrib.auth.urls")),
    path("register", views.Register, name="register")
]