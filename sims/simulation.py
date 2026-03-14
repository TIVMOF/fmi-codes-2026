import numpy as np


class Simulation:

    def __init__(self, hazard_zones, escape_zones, dims, n_particles):
        assert isinstance(hazard_zones, list)
        assert isinstance(hazard_zones[0], list)
        assert isinstance(escape_zones, list)
        assert isinstance(escape_zones[0], list)
        assert hazard_zones != escape_zones
        assert isinstance(dims, tuple)
        assert len(dims) == 2
        assert isinstance(n_particles, int) and n_particles > 0


        self._hazard_zones = hazard_zones
        self._escape_zones = escape_zones
        self._dims = dims
        self._n_particles = n_particles


    def simulate(self):
        particle_spawn = np.random.uniform(self._dims[0], self._dims[1], size=(self._n_particles, 3))
        particle_spawn[:, 2] = 0








sim = Simulation([[1],[2]], [[1],[3]], (100, 10), 10)

print(sim.simulate())

