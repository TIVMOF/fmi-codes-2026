from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_simulations, name='simulation-list'),
    path('create/', views.create_simulation, name='simulation-create'),
    path('<int:simulation_id>/', views.get_simulations, name='simulation-detail'),
    path('<int:simulation_id>/delete/', views.delete_simulation, name='simulation-delete'),
]