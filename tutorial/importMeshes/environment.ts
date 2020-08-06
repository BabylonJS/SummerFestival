import { Scene, Mesh, Vector3, SceneLoader } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        // var ground = Mesh.CreateBox("ground", 24, this._scene);
        // ground.scaling = new Vector3(1,.02,1);

        const assets = await this._loadAsset();
        //Loop through all environment meshes that were imported
        assets.allMeshes.forEach(m => {
            m.receiveShadows = true;
            m.checkCollisions = true;
        });
    }

    //Load all necessary meshes for the environment
    public async _loadAsset() {
        const result = await SceneLoader.ImportMeshAsync(null, "./models/", "envSetting.glb", this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        return {
            env: env, //reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes // all of the meshes that are in the environment
        }
    }
}