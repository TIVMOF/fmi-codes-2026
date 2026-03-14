import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import logging

from .models import Simulation, SimulationVideo
from services.vercel_blob import upload_video

logger = logging.getLogger(__name__)


def run_simulation(simulation_data):

    #temporary
    return "test.mp4"

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_simulation(request):
    try:
        payload = request.data if isinstance(request.data, dict) else {}

        simulation_data = payload.get("data", payload)
        simulation_name = payload.get("name") or "Untitled Simulation"
        grid_width = payload.get("gridWidth") or payload.get("grid_width") or 0
        grid_height = payload.get("gridHeight") or payload.get("grid_height") or 0
        schematic_url = payload.get("schematicUrl") or payload.get("schematic_url")

        simulation = Simulation.objects.create(
            user=request.user,
            name=simulation_name,
            data=simulation_data,
            grid_width=grid_width,
            grid_height=grid_height,
            schematic_url=schematic_url,
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
                "status": simulation.status,
                "video_url": video_url
            })

        except Exception as processing_error:
            logger.error(f"Processing failed for simulation {simulation.id}: {str(processing_error)}")

            # Keep simulation available instead of failing the create request.
            return JsonResponse({
                "success": True,
                "simulation_id": simulation.id,
                "status": simulation.status,
                "warning": f"Simulation created but processing is delayed: {str(processing_error)}"
            }, status=201)

    except Exception as e:
        logger.error(f"Unexpected error in create_simulation: {str(e)}")
        return JsonResponse({"success": False, "error": "Internal server error"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
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
                        "name": simulation.name,
                        "status": simulation.status,
                        "data": simulation.data,
                        "grid_width": simulation.grid_width,
                        "grid_height": simulation.grid_height,
                        "schematic_url": simulation.schematic_url,
                        "created_at": simulation.created_at.isoformat(),
                        "updated_at": simulation.updated_at.isoformat(),
                        "video_url": videos.first().video_url if videos.exists() else None,
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
                    "name": s.name,
                    "status": s.status,
                    "data": s.data,
                    "grid_width": s.grid_width,
                    "grid_height": s.grid_height,
                    "schematic_url": s.schematic_url,
                    "created_at": s.created_at.isoformat(),
                    "updated_at": s.updated_at.isoformat(),
                    "video_count": videos.count(),
                    "video_url": videos.first().video_url if videos.exists() else None,
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
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
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