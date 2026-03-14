from django.db import models
from django.conf import settings


class Simulation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="simulations"
    )

    name = models.CharField(max_length=255, default="Untitled Simulation")
    data = models.JSONField(default=dict, blank=True)
    schematic_url = models.URLField(blank=True, null=True)
    grid_width = models.PositiveIntegerField(default=0)
    grid_height = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("processing", "Processing"),
            ("completed", "Completed"),
            ("failed", "Failed")
        ],
        default="processing"
    )

    def __str__(self):
        return f"Simulation {self.id} - {self.user}"


class SimulationVideo(models.Model):
    simulation = models.ForeignKey(
        Simulation,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video for Simulation {self.simulation.id}"