import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
import logging

from .models import Simulation, SimulationVideo
from services.vercel_blob import upload_video

logger = logging.getLogger(__name__)


def run_simulation(simulation_data):

    #temporary
    return "test.mp4"

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def create_simulation(request):
    try:
        # Parse JSON data
        try:
            simulation_data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        simulation = Simulation.objects.create(
            user=request.user,
            status="processing"
        )

        logger.info(f"Simulation {simulation.id} created for user {request.user.username}")

        try:
            video_path = run_simulation(simulation_data)

            logger.info(f"Simulation completed, video generated at: {video_path}")

            logger.info(f"Uploading video from {video_path}")
            video_url = upload_video(video_path)

            SimulationVideo.objects.create(
                simulation=simulation,
                video_url=video_url
            )

            simulation.status = "completed"
            simulation.save()

            logger.info(f"Simulation {simulation.id} completed successfully")

            return JsonResponse({
                "success": True,
                "simulation_id": simulation.id,
                "video_url": video_url
            })

        except Exception as processing_error:
            simulation.status = "failed"
            simulation.save()

            logger.error(f"Processing failed for simulation {simulation.id}: {str(processing_error)}")

            return JsonResponse({
                "success": False,
                "error": f"Simulation failed: {str(processing_error)}"
            }, status=500)

    except Exception as e:
        logger.error(f"Unexpected error in create_simulation: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error"
        }, status=500)


@login_required
def get_simulations(request, simulation_id=None):
    try:
        if simulation_id:
            try:
                simulation = Simulation.objects.get(
                    id=simulation_id,
                    user=request.user
                )

                videos = simulation.videos.all()

                return JsonResponse({
                    "success": True,
                    "simulation": {
                        "id": simulation.id,
                        "status": simulation.status,
                        "created_at": simulation.created_at.isoformat(),
                        "videos": [
                            {
                                "url": v.video_url,
                                "created_at": v.created_at.isoformat()
                            } for v in videos
                        ]
                    }
                })

            except Simulation.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "error": "Simulation not found"
                }, status=404)

        else:
            simulations = Simulation.objects.filter(
                user=request.user
            ).order_by('-created_at')

            data = []
            for s in simulations:
                videos = s.videos.all()

                data.append({
                    "id": s.id,
                    "status": s.status,
                    "created_at": s.created_at.isoformat(),
                    "video_count": videos.count(),
                    "videos": [
                        {
                            "url": v.video_url,
                            "created_at": v.created_at.isoformat()
                        } for v in videos
                    ]
                })

            return JsonResponse({
                "success": True,
                "simulations": data,
                "count": len(data)
            })

    except Exception as e:
        logger.error(f"Error in get_simulations: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error"
        }, status=500)

# Optional: Add a delete endpoint
@login_required
@require_http_methods(["DELETE"])
def delete_simulation(request, simulation_id):
    """
    Delete a simulation (soft delete recommended)
    """
    try:
        simulation = Simulation.objects.get(
            id=simulation_id,
            user=request.user
        )

        # Option 1: Hard delete
        # simulation.delete()

        # Option 2: Soft delete (if you have is_deleted field)
        if hasattr(simulation, 'is_deleted'):
            simulation.is_deleted = True
            simulation.save()
            message = "Simulation soft deleted"
        else:
            simulation.delete()
            message = "Simulation deleted"

        return JsonResponse({
            "success": True,
            "message": message
        })

    except Simulation.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Simulation not found"
        }, status=404)
    except Exception as e:
        logger.error(f"Error deleting simulation: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error"
        }, status=500)