from manim import *
import json
import os
from WallPlan import WallPlan
from TablePlan import TablePlan
from DoorPlan import DoorPlan

class BuildScene(Scene):
    def __init__(self, wall_data=None, table_data=None, door_data=None, **kwargs):
        self.wall_data = wall_data or []
        self.table_data = table_data or []
        self.door_data = door_data or []
        super().__init__(**kwargs)

    @classmethod
    def from_json(cls, file_path, **kwargs):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Error: The file '{file_path}' was not found.")

        try:
            with open(file_path, 'r') as f:
                d = json.load(f)
        except json.JSONDecodeError as e:

            raise ValueError(f"Error: '{file_path}' is not a valid JSON file. Details: {e}")

        if "data" not in d:
            print("Warning: JSON root 'data' key missing. Looking for keys at top level...")
            source = d
        else:
            source = d["data"]

        wall_data = source.get("walls", [])
        table_data = source.get("tables", [])
        door_data = source.get("doors", [])

        if not wall_data and not table_data:
            print("Warning: No wall or table data found. The animation will be empty.")

        return cls(
            wall_data=wall_data,
            table_data=table_data,
            door_data=door_data,
            **kwargs
        )

    def construct(self):
        walls = WallPlan(self.wall_data)
        tables = TablePlan(self.table_data)
        doors = DoorPlan(self.door_data)
        
        plan_root = VGroup(walls, tables, doors)
        
        if len(plan_root) > 0:
            plan_root.scale_to_fit_width(config.frame_width - 2)
            plan_root.move_to(ORIGIN)

            walls.animate_appearance(self)
            tables.animate_appearance(self)
            doors.animate_appearance(self)
        else:
            self.add(Text("Empty Plan Data", color=RED).scale(0.5))
            
        self.wait()