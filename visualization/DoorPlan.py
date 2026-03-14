from Element import Element
from manim import VGroup, Line, Create, YELLOW, np, Succession

class DoorPlan(Element):
    def __init__(self, doors_list, door_config=None, **kwargs):
        super().__init__(**kwargs)
        self.door_config = door_config or {"stroke_width": 4, "color": YELLOW}
        self.doors = VGroup()
        self.add(self.doors)
        
        for d_data in doors_list:
            if "start" not in d_data or "end" not in d_data:
                print(f"Data Error: Door skipped. Missing 'start' or 'end' keys in: {d_data}")
                continue

            try:
                start_node = self._get_or_create_dot(d_data["start"])
                end_node = self._get_or_create_dot(d_data["end"])
                
                p1 = start_node.get_center()
                p2 = end_node.get_center()

                if np.array_equal(p1, p2):
                    print(f"Data Warning: Door skipped. Start and End points are identical at {p1}")
                    continue

                door_line = Line(p1, p2, **self.door_config)
                self.doors.add(door_line)

            except Exception as e:
                print(f"Error processing door {d_data}: {e}")
                continue

    def animate_appearance(self, speed_factor=1.0):
        dot_anim = super().animate_appearance(speed_factor)
        
        if len(self.doors) > 0:
            door_anim = Create(self.doors, lag_ratio=0.2, run_time=1.0 * speed_factor)
            return Succession(dot_anim, door_anim)
        
        return dot_anim