from django.http.request import HttpRequest
from django.http.response import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST
from .models import User
from hashlib import sha256
from os import urandom

@require_POST
def register(request : HttpRequest):
    username = request.POST["username"]
    password1 = request.POST["password1"]
    password2 = request.POST["password2"]
    if password1 != password2:
        return HttpResponseBadRequest("Passwords do not match")
    if User.objects.filter(username = username).exists():
        return HttpResponseBadRequest("Username is taken")
    salt = urandom(8)
    hashed_pass = int.from_bytes(sha256(salt + password1.encode("utf-8")).digest(), "big")
    new_user = User(username=username, salt=int.from_bytes(salt, "big"), hashed_pass=hashed_pass)
    new_user.save()

@require_POST
def verify(request : HttpRequest):
    username = request.POST["username"]
    password = request.POST["password"]
    try:
        user_obj : User = User.objects.get(username=username)
    except:
        return HttpResponseBadRequest("User not found")
    salt = user_obj.salt
    check_hash = sha256()
            
