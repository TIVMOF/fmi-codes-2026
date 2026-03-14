from manim import Scene
from WallPlan import WallPlan
from TablePlan import TablePlan

class BuildScene(Scene):
    def __init__(self, wall_data=None, table_data=None, **kwargs):
        self.wall_data = wall_data or []
        self.table_data = table_data or []
        super().__init__(**kwargs)

    def construct(self):
        walls = WallPlan(self.wall_data)
        tables = TablePlan(self.table_data)

        walls.animate_appearance(self)
        tables.animate_appearance(self)
        
        self.wait()