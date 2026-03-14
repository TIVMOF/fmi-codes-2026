from Element import Element
from manim import VGroup, BLUE, Polygon, Create, Succession

class TablePlan(Element):
    def __init__(self, tables_list, table_config=None, **kwargs):
        super().__init__(**kwargs)
        self.table_config = table_config or {"stroke_width": 2, "color": BLUE, "fill_opacity": 0.2}
        self.tables = VGroup()
        self.add(self.tables)

        for t in tables_list:
            required_keys = ["upperLeft", "upperRight", "lowerRight", "lowerLeft"]
            if not all(key in t for key in required_keys):
                missing = [k for k in required_keys if k not in t]
                print(f"Data Error: Table skipped. Missing keys: {missing}")
                continue

            try:
                points = [
                    self._get_or_create_dot(t["upperLeft"]).get_center(),
                    self._get_or_create_dot(t["upperRight"]).get_center(),
                    self._get_or_create_dot(t["lowerRight"]).get_center(),
                    self._get_or_create_dot(t["lowerLeft"]).get_center(),
                ]

                table_shape = Polygon(*points, **self.table_config)
                self.tables.add(table_shape)
                
            except Exception as e:
                print(f"Error processing table at {t}: {e}")
                continue

    def animate_appearance(self, speed_factor=1.0):
        dot_anim = super().animate_appearance(speed_factor)
        
        if len(self.tables) > 0:
            table_anim = Create(self.tables, lag_ratio=0.2, run_time=1.0 * speed_factor)
            return Succession(dot_anim, table_anim)
        
        return dot_anim