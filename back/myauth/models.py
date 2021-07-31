from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=24)
    salt = models.CharField(max_length=8)
    hashed_pass = models.IntegerField(max_length=24)
