from django.http import HttpResponse, HttpRequest
from .models import HighScore
from django.core import serializers
import logging

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponse("Hello, World!")

def scores_name(request, name):
    data = HighScore.objects.filter(name=name)
    return HttpResponse(serializers.serialize("json", data))

def top_n(request : HttpRequest, year=None, month=None, day=None):
    data = HighScore.objects.all()
    if year:
        data = data.filter(timestamp__year=year)
    if month:
        data = data.filter(timestamp__month=month)
    if day:
        data = data.filter(timestamp__day=day)
    data = data.order_by("-score")
    startn = int(request.GET.get("startn", default=0))
    n = int(request.GET.get("n", default=-1))
    data = data[startn:(startn + n if n >= 0 else None)]
    if not request.GET.get("human"):
        data = serializers.serialize("json", data)
    return HttpResponse(data)