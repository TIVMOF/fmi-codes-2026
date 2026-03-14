from PlanElement import PlanElement
from manim import VGroup, Line, Scene, Create, WHITE

class WallPlan(PlanElement):
    def __init__(self, walls_list, wall_config=None, **kwargs):
        super().__init__(**kwargs)
        self.wall_config = wall_config or {"stroke_width": 4, "color": WHITE}
        self.walls = VGroup()
        self.add(self.walls)
        
        for w in walls_list:
            s = self._get_or_create_dot(w["start"])
            e = self._get_or_create_dot(w["end"])
            self.walls.add(Line(s.get_center(), e.get_center(), **self.wall_config))

    def animate_appearance(self, scene: Scene, speed_factor=1.0):
        super().animate_appearance(scene, speed_factor)
        scene.play(Create(self.walls, lag_ratio=0.1), run_time=1.0 * speed_factor)