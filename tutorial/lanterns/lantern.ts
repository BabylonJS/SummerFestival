import { PBRMetallicRoughnessMaterial, Mesh, Scene, Vector3, AnimationGroup, PointLight, Color3 } from "@babylonjs/core";

export class Lantern {
    public _scene: Scene;

    public mesh: Mesh;
    public isLit: boolean = false;
    private _lightSphere: Mesh;
    private _lightmtl: PBRMetallicRoughnessMaterial;

    constructor(lightmtl: PBRMetallicRoughnessMaterial, mesh: Mesh, scene: Scene, position: Vector3, animationGroups?: AnimationGroup) {
        this._scene = scene;
        this._lightmtl = lightmtl;

        //create the lantern's sphere of illumination
        const lightSphere = Mesh.CreateSphere("illum", 4, 20, this._scene);
        lightSphere.scaling.y = 2;
        lightSphere.setAbsolutePosition(position);
        lightSphere.parent = this.mesh;
        lightSphere.isVisible = false;
        lightSphere.isPickable = false;
        this._lightSphere = lightSphere;

        //load the lantern mesh
        this._loadLantern(mesh, position);
    }

    private _loadLantern(mesh: Mesh, position: Vector3): void {
        this.mesh = mesh;
        this.mesh.scaling = new Vector3(.8, .8, .8);
        this.mesh.setAbsolutePosition(position);
        this.mesh.isPickable = false;
    }

    public setEmissiveTexture(): void {
        this.isLit = true;

        //swap texture
        this.mesh.material = this._lightmtl;

        //create light source for the lanterns
        const light = new PointLight("lantern light", this.mesh.getAbsolutePosition(), this._scene);
        light.intensity = 30;
        light.radius = 2;
        light.diffuse = new Color3(0.45, 0.56, 0.80);
        this._findNearestMeshes(light);
    }

    //when the light is created, only include the meshes that are within the sphere of illumination
    private _findNearestMeshes(light: PointLight): void {
        this._scene.getMeshByName("__root__").getChildMeshes().forEach(m => {
            if (this._lightSphere.intersectsMesh(m)) {
                light.includedOnlyMeshes.push(m);
            }
        });

        //get rid of the sphere
        this._lightSphere.dispose();
    }

}