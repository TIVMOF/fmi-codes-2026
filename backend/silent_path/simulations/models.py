from django.db import models
from django.conf import settings

class Simulation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="simulations"
    )
    # ... rest of your model

class SimulationVideo(models.Model):
    simulation = models.ForeignKey(
        'Simulation',
        on_delete=models.CASCADE,
        related_name="videos"
    )
    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)