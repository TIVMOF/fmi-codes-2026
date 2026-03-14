from Element import Element
from manim import VGroup, Dot, PINK, linear

class People(Element):
    def __init__(self, initial_positions, dot_config=None, **kwargs):
        super().__init__(**kwargs)
        self.person_config = dot_config or {"radius": 0.08, "color": PINK}
        self.people = VGroup()
        
        for pos in initial_positions:
            p = Dot(point=self._validate_coords(pos), **self.person_config)
            self.people.add(p)
        
        self.add(self.people)

    def animate_appearance(self, scene, new_positions, run_time=0.1):
        animations = []
        for i, pos in enumerate(new_positions):
            animations.append(self.people[i].animate.move_to(self._validate_coords(pos)))
        
        scene.play(*animations, run_time=run_time, rate_func=linear)