import { Scene, Mesh, Vector3, SceneLoader, TransformNode, PBRMetallicRoughnessMaterial, ExecuteCodeAction, ActionManager, Texture, Color3 } from "@babylonjs/core";
import { Lantern } from "./lantern";
import { Player } from "./characterController";

export class Environment {
    private _scene: Scene;

    //Meshes
    private _lanternObjs: Array<Lantern>; //array of lanterns that need to be lit
    private _lightmtl: PBRMetallicRoughnessMaterial; // emissive texture for when lanterns are lit
    
    constructor(scene: Scene) {
        this._scene = scene;

        this._lanternObjs = [];
        //create emissive material for when lantern is lit
        const lightmtl = new PBRMetallicRoughnessMaterial("lantern mesh light", this._scene);
        lightmtl.emissiveTexture = new Texture("/textures/litLantern.png", this._scene, true, false);
        lightmtl.emissiveColor = new Color3(0.8784313725490196, 0.7568627450980392, 0.6235294117647059);
        this._lightmtl = lightmtl;
    }

    public async load() {
        // var ground = Mesh.CreateBox("ground", 24, this._scene);
        // ground.scaling = new Vector3(1,.02,1);

        const assets = await this._loadAsset();
        //Loop through all environment meshes that were imported
        assets.allMeshes.forEach(m => {
            m.receiveShadows = true;
            m.checkCollisions = true;

            if (m.name == "ground") { //dont check for collisions, dont allow for raycasting to detect it(cant land on it)
                m.checkCollisions = false;
                m.isPickable = false;
            }
            //areas that will use box collisions
            if (m.name.includes("stairs") || m.name == "cityentranceground" || m.name == "fishingground.001" || m.name.includes("lilyflwr")) {
                m.checkCollisions = false;
                m.isPickable = false;
            }
            //collision meshes
            if (m.name.includes("collision")) {
                m.isVisible = false;
                m.isPickable = true;
            }
            //trigger meshes
            if (m.name.includes("Trigger")) {
                m.isVisible = false;
                m.isPickable = false;
                m.checkCollisions = false;
            }
        });
        
        //--LANTERNS--
        assets.lantern.isVisible = false; //original mesh is not visible
        //transform node to hold all lanterns
        const lanternHolder = new TransformNode("lanternHolder", this._scene);
        for (let i = 0; i < 22; i++) {
            //Mesh Cloning
            let lanternInstance = assets.lantern.clone("lantern" + i); //bring in imported lantern mesh & make clones
            lanternInstance.isVisible = true;
            lanternInstance.setParent(lanternHolder);

            //Create the new lantern object
            let newLantern = new Lantern(this._lightmtl, lanternInstance, this._scene, assets.env.getChildTransformNodes(false).find(m => m.name === "lantern " + i).getAbsolutePosition());
            this._lanternObjs.push(newLantern);
        }
         //dispose of original mesh and animation group that were cloned
         assets.lantern.dispose();
    }

    //Load all necessary meshes for the environment
    public async _loadAsset() {
        const result = await SceneLoader.ImportMeshAsync(null, "./models/", "envSetting.glb", this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        //loads lantern mesh
        const res = await SceneLoader.ImportMeshAsync("", "./models/", "lantern.glb", this._scene);

        //extract the actual lantern mesh from the root of the mesh that's imported, dispose of the root
        let lantern = res.meshes[0].getChildren()[0];
        lantern.parent = null;
        res.meshes[0].dispose();

        return {
            env: env, //reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes, // all of the meshes that are in the environment
            lantern: lantern as Mesh
        }
    }

    public checkLanterns(player: Player) {
        if (!this._lanternObjs[0].isLit) {
            this._lanternObjs[0].setEmissiveTexture();
        }

        this._lanternObjs.forEach(lantern => {
            player.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: lantern.mesh
                    },
                    () => {
                        //if the lantern is not lit, light it up & reset sparkler timer
                        if (!lantern.isLit && player.sparkLit) {
                            player.lanternsLit += 1; //increment the lantern count
                            lantern.setEmissiveTexture(); //"light up" the lantern
                            //reset the sparkler
                            player.sparkReset = true;
                            player.sparkLit = true;
                        }
                        //if the lantern is lit already, reset the sparkler
                        else if (lantern.isLit) {
                            player.sparkReset = true;
                            player.sparkLit = true;
                        }
                    }
                )
            );
        });
    }
}