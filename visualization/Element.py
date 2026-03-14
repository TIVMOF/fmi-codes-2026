from abc import ABC, abstractmethod
from manim import VGroup, RED, Dot, FadeIn, Wait
import numpy as np

class Element(VGroup, ABC):
    def __init__(self, dot_config=None, **kwargs):
        super().__init__(**kwargs)
        self.dot_config = dot_config or {"radius": 0.06, "color": RED}
        self.dots = VGroup()
        self._dot_map = {}
        self.add(self.dots)

    def _validate_coords(self, coords):
        if not isinstance(coords, (list, tuple, np.ndarray)):
            raise ValueError(f"Invalid coordinate type: {type(coords)}. Expected list or tuple.")
        
        if len(coords) == 2:
            return [*coords, 0]
        elif len(coords) == 3:
            return coords
        else:
            raise ValueError(f"Invalid coordinate length: {len(coords)}. Expected 2 (x,y) or 3 (x,y,z).")

    def _get_or_create_dot(self, coords):
        try:
            sanitized_coords = self._validate_coords(coords)
            
            coords_t = tuple(np.round(sanitized_coords, 3))
            
            if coords_t not in self._dot_map:
                new_dot = Dot(point=coords_t, **self.dot_config)
                self._dot_map[coords_t] = new_dot
                self.dots.add(new_dot)
            
            return self._dot_map[coords_t]
            
        except Exception as e:
            print(f"Data Error in {self.__class__.__name__}: Failed to process point {coords}. {e}")
            raise

    @abstractmethod
    def animate_appearance(self, speed_factor=1.0):
        if len(self.dots) > 0:
            return FadeIn(self.dots, lag_ratio=0.1, run_time=0.5 * speed_factor)
        return Wait(0)