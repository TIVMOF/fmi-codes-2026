from Element import Element
from manim import VGroup, Line, Create, RED, np, Succession

class WallPlan(Element):
    def __init__(self, walls_list, wall_config=None, **kwargs):
        super().__init__(**kwargs)
        self.wall_config = wall_config or {"stroke_width": 4, "color": RED}
        self.walls = VGroup()
        self.add(self.walls)
        
        if not isinstance(walls_list, (list, tuple)):
            print(f"Data Error: Expected list for walls_list, got {type(walls_list)}")
            return

        for w_data in walls_list:
            if "start" not in w_data or "end" not in w_data:
                print(f"Data Error: Wall segment skipped. Missing 'start' or 'end' in: {w_data}")
                continue

            try:
                start_node = self._get_or_create_dot(w_data["start"])
                end_node = self._get_or_create_dot(w_data["end"])
                
                p1 = start_node.get_center()
                p2 = end_node.get_center()

                if np.array_equal(p1, p2):
                    print(f"Data Warning: Zero-length wall skipped at {p1}")
                    continue

                wall_line = Line(p1, p2, **self.wall_config)
                self.walls.add(wall_line)

            except Exception as e:
                print(f"Error processing wall {w_data}: {e}")
                continue

    def animate_appearance(self, speed_factor=1.0):
        dot_anim = super().animate_appearance(speed_factor)
        
        if len(self.walls) > 0:
            wall_anim = Create(self.walls, lag_ratio=0.2, run_time=1.0 * speed_factor)
            return Succession(dot_anim, wall_anim)
        
        return dot_anim