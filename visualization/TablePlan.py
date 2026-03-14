from PlanElement import PlanElement
from manim import VGroup, YELLOW, Polygon, Scene, FadeIn, UP

class TablePlan(PlanElement):
    def __init__(self, tables_list, table_config=None, **kwargs):
        super().__init__(**kwargs)
        self.table_config = table_config or {"stroke_width": 2, "color": YELLOW, "fill_opacity": 0.2}
        self.tables = VGroup()
        self.add(self.tables)

        for t in tables_list:
            points = [t["upLeft"], t["upRight"], t["lowRight"], t["lowLeft"]]
            for p in points: self._get_or_create_dot(p)
            
            table_shape = Polygon(*points, **self.table_config)
            self.tables.add(table_shape)

    def animate_appearance(self, scene: Scene, speed_factor=1.0):
        super().animate_appearance(scene, speed_factor)
        scene.play(FadeIn(self.tables, shift=UP*0.2), run_time=0.8 * speed_factor)