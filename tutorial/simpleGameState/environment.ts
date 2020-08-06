import { Scene, Mesh, Vector3 } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        var ground = Mesh.CreateBox("ground", 24, this._scene);
        ground.scaling = new Vector3(1,.02,1);
    }
}