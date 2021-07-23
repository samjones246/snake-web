from django.db import models

class HighScore(models.Model):
    score = models.IntegerField(default=0)
    name = models.CharField(max_length=24)
    timestamp = models.DateTimeField()
    def __str__(self) -> str:
        return f"{self.name}: {self.score} ({self.timestamp})"
