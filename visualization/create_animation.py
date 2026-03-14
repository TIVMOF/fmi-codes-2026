from BuildScene import BuildScene

if __name__ == "__main__":
    my_frontend_data = [
        {"start": [-3, -2, 0], "end": [3, -2, 0]},
        {"start": [3, -2, 0], "end": [3, 2, 0]},
        {"start": [3, 2, 0], "end": [-3, 2, 0]},
        {"start": [-3, 2, 0], "end": [-3, -2, 0]},
    ]
    
    # Passing data directly into the Scene instance
    scene = BuildScene(wall_data=my_frontend_data)
    scene.render()