from abc import ABC, abstractmethod
from manim import *

class PlanElement(VGroup, ABC):
    def __init__(self, dot_config=None, **kwargs):
        super().__init__(**kwargs)
        self.dot_config = dot_config or {"radius": 0.06, "color": BLUE}
        self.dots = VGroup()
        self._dot_map = {}
        self.add(self.dots)

    def _get_or_create_dot(self, coords):
        coords_t = tuple(np.round(coords, 3))
        if coords_t not in self._dot_map:
            new_dot = Dot(point=coords_t, **self.dot_config)
            self._dot_map[coords_t] = new_dot
            self.dots.add(new_dot)
        return self._dot_map[coords_t]

    @abstractmethod
    def animate_appearance(self, scene: Scene, speed_factor=1.0):
        scene.play(FadeIn(self.dots), run_time=0.5 * speed_factor)