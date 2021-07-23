from django.http import HttpResponse, HttpRequest
from .models import HighScore
from django.core import serializers
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponse("Hello, World!")

def retrieve(request : HttpRequest, year=None, month=None, day=None):
    data = HighScore.objects.all()
    if year:
        data = data.filter(timestamp__year=year)
    if month:
        data = data.filter(timestamp__month=month)
    if day:
        data = data.filter(timestamp__day=day)
    name = request.GET.get("name")
    if name:
        data = data.filter(name=name)
    data = data.order_by("-score")
    startn = int(request.GET.get("startn", default=0))
    n = int(request.GET.get("n", default=-1))
    data = data[startn:(startn + n if n >= 0 else None)]
    if not request.GET.get("human"):
        data = serializers.serialize("json", data)
    return HttpResponse(data)

def submit(request : HttpRequest):
    # TODO: This should be POST
    name = request.GET.get("name")
    score = int(request.GET.get("score"))
    record = HighScore(name=name, score=score, timestamp=timezone.now())
    try:
        record.save()
        return HttpResponse("Success.")
    except:
        return HttpResponse("Failed to save score", status=500)