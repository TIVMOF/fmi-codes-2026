from PlanElement import PlanElement
from manim import VGroup, YELLOW, Polygon, Scene, FadeIn, UP

class TablePlan(PlanElement):
    def __init__(self, tables_list, table_config=None, **kwargs):
        super().__init__(**kwargs)
        self.table_config = table_config or {"stroke_width": 2, "color": YELLOW, "fill_opacity": 0.2}
        self.tables = VGroup()
        self.add(self.tables)

        for t in tables_list:
            required_keys = ["upLeft", "upRight", "lowRight", "lowLeft"]
            if not all(key in t for key in required_keys):
                missing = [k for k in required_keys if k not in t]
                print(f"Data Error: Table skipped. Missing keys: {missing}")
                continue

            try:
                points = [
                    self._get_or_create_dot(t["upLeft"]).get_center(),
                    self._get_or_create_dot(t["upRight"]).get_center(),
                    self._get_or_create_dot(t["lowRight"]).get_center(),
                    self._get_or_create_dot(t["lowLeft"]).get_center(),
                ]

                table_shape = Polygon(*points, **self.table_config)
                self.tables.add(table_shape)
                
            except Exception as e:
                print(f"Error processing table at {t}: {e}")
                continue

    def animate_appearance(self, scene: Scene, speed_factor=1.0):
        if len(self.tables) > 0:
            super().animate_appearance(scene, speed_factor)
            scene.play(
                FadeIn(self.tables, shift=UP * 0.2, lag_ratio=0.1), 
                run_time=0.8 * speed_factor
            )
        else:
            print("Animation Warning: No tables to animate in TablePlan.")