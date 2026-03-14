from manim import *
import json
import os
from WallPlan import WallPlan
from TablePlan import TablePlan
from DoorPlan import DoorPlan
from People import People

class BuildScene(Scene):
    def __init__(self, wall_data=None, table_data=None, door_data=None, frames=None, **kwargs):
        self.wall_data = wall_data or []
        self.table_data = table_data or []
        self.door_data = door_data or []
        self.frames = frames or []
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
        people_frames = source.get("simulation_frames", [])

        if not wall_data and not table_data and not people_frames:
            print("Warning: No wall, table or people frame data found. The animation will be empty.")

        return cls(
            wall_data=wall_data,
            table_data=table_data,
            door_data=door_data,
            frames=people_frames,
            **kwargs
        )

    def construct(self):
        walls = WallPlan(self.wall_data)
        tables = TablePlan(self.table_data)
        doors = DoorPlan(self.door_data)
        people_layer = People(self.frames[0])
        
        plan_root_and_people = VGroup(walls, tables, doors, people_layer)
        
        if len(plan_root_and_people) > 0:
            plan_root_and_people.move_to(ORIGIN)
            plan_root_and_people.scale_to_fit_width(config.frame_width * 0.8)

            if plan_root_and_people.height > config.frame_height * 0.8:
                plan_root_and_people.scale_to_fit_height(config.frame_height * 0.8)

            self.animate_entire_plan(walls, tables, doors)

            self.play(FadeIn(people_layer.people))

            for frame_data in self.frames[1:]:
                people_layer.animate_appearance(self, frame_data, run_time=0.5)
        else:
            self.add(Text("Empty Plan Data", color=RED).scale(0.5))
            
        self.wait()

    def animate_entire_plan(self, walls, tables, doors):
        self.play(walls.animate_appearance())
        
        self.play(
            AnimationGroup(
                tables.animate_appearance(),
                doors.animate_appearance(),
                lag_ratio=0.3
            )
        )