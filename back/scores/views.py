from django.http import HttpResponse, HttpRequest
from django.http.response import HttpResponseBadRequest, JsonResponse
from .models import HighScore
from django.core import serializers
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

periods = {
    "alltime": 0,
    "yearly": 1,
    "monthly": 2,
    "daily": 3
}


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
    timestamp=timezone.now()
    alltime = HighScore.objects.filter(name=name)
    yearly = alltime.filter(timestamp__year=timestamp.year)
    monthly = yearly.filter(timestamp__month=timestamp.month)
    daily = monthly.filter(timestamp__day=timestamp.day)

    is_daily_best = daily.count() == 0 or score > daily.order_by("-score")[0].score
    is_monthly_best = monthly.count() == 0 or score > monthly.order_by("-score")[0].score
    is_yearly_best = yearly.count() == 0 or score > yearly.order_by("-score")[0].score
    is_alltime_best = alltime.count() == 0 or score > alltime.order_by("-score")[0].score

    if is_daily_best:
        record = HighScore(name=name, score=score, timestamp=timestamp)
        try:
            record.save()
        except:
            return HttpResponse("Failed to save score", status=500)
    
    return JsonResponse({
        "daily":is_daily_best, 
        "monthly":is_monthly_best, 
        "yearly":is_yearly_best, 
        "alltime":is_alltime_best
    })

def rank(request, period, day=None, month=None, year=None):
    try:
        level = periods[period]
    except:
        return HttpResponseBadRequest(f"Invalid time period '{period}', must be 'daily', 'monthly', 'yearly' or 'alltime'")

    today = timezone.now()
    day = day or today.day
    month = month or today.month
    year = year or today.year

    name = request.GET.get("name")
    user = HighScore.objects.filter(name=name)
    other = HighScore.objects.exclude(name=name)
    
    if level >= 1:
        user = user.filter(timestamp__year=year)
        other = other.filter(timestamp__year=year)
    if level >= 2:
        user = user.filter(timestamp__month=month)
        other = other.filter(timestamp__month=month)
    if level >= 3:
        user = user.filter(timestamp__day=day)
        other = other.filter(timestamp__day=day)
    try:
        best = user.order_by("-score")[0]
    except:
        return HttpResponse(-1)
    _rank = other.filter(score__gt=best.score).count()
    return HttpResponse(_rank)
        
    


