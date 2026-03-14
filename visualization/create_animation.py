from BuildScene import BuildScene

if __name__ == "__main__":
    scene = BuildScene.from_json('example.json')
    scene.render()