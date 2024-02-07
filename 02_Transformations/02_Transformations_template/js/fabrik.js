class FabrikLink3 {
    constructor(baseMtx, baseAngleY, baseAngleZ) {
        this.start = this._getPosition(baseMtx);
        this.baseAngleY = baseAngleY;
        this.baseAngleZ = baseAngleZ;
        this.length = [2.4, 2.4, 1.2];
        this.joints = [this.start]; // Initialize with the base joint
        this.lengthTotal = this.length.reduce((a, b) => a + b, 0);
        this.angleY = [baseAngleY, 0, 0];
        this.angleZ = [baseAngleZ, 0, 0];

        // Initialize joint positions based on start and lengths
        var jointMtx = baseMtx.clone();
        for (let i = 0; i < this.length.length; i++) {
            jointMtx.multiply(this._defineTranslation(0, this.length[i], 0));
            this.joints.push(this._getPosition(jointMtx));
        }
    }

    solve(target) {
        if (this._recheable(target)) {
            // Perform iterations
            for (let i = 0; i < 10; i++) {
                this._backward(target);
                this._forward(this.start);
                // Early termination condition if end is close enough to target
                if (this._distance(this.joints[this.joints.length - 1], target) < 0.01) break;
            }

            this._calculateAngles();
        }
        return { y: this.angleY, z: this.angleZ};
    }

    _calculateAngles() {
        // Calculate angles based on joint positions
        var normals = [];
        for (let i = 0; i < this.joints.length - 1; i++) {
            let v = new THREE.Vector3().subVectors(this.joints[i + 1], this.joints[i]);
            normals.push(v.normalize());
        }
        var refMtx = this._defineTranslation(0, 0, 0);
        for (let i = 0; i < this.joints.length - 1; i++) {
            let angle = this._getAngle(refMtx, normals[i]);
            this._checkAngle(angle, normals[i]);
            this.angleY[i] = angle.y;
            this.angleZ[i] = angle.z;
            refMtx.multiply(this._defineRotation_Y(angle.y));
            refMtx.multiply(this._defineRotation_Z(angle.z));
        }
    }

    _checkAngle(angle, normal) {
        var Mtx = this._defineRotation_Y(angle.y)
            .multiply(this._defineRotation_Z(angle.z))
            .multiply(this._defineTranslation(0, 1, 0));
    }

    _getAngle(coordMtx, normal) {
        var xhat = new THREE.Vector3(coordMtx.elements[0], coordMtx.elements[1], coordMtx.elements[2]);
        var yhat = new THREE.Vector3(coordMtx.elements[4], coordMtx.elements[5], coordMtx.elements[6]);
        var zhat = new THREE.Vector3(coordMtx.elements[8], coordMtx.elements[9], coordMtx.elements[10]);
        var xhat_n = xhat.dot(normal);
        var yhat_n = yhat.dot(normal);
        var zhat_n = zhat.dot(normal);
        var Yangle = Math.atan2(zhat_n, Math.sqrt(xhat_n ** 2 + yhat_n ** 2));
        var Zangle = Math.atan2(Math.sqrt(xhat_n ** 2 + zhat_n ** 2), yhat_n);
        if (xhat_n > 0) {
            Yangle = - Yangle;
            Zangle = - Zangle;
        }
        return { y: Yangle, z: Zangle };
    }
    
    _distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
    }

    _recheable(target) {
        var d = this._distance(this.start, target);
        if (this.lengthTotal >= d) {
            return true;
        } else {
            console.log("Target is out of reach!");
            console.log("start: ", this.start, " target: ", target, " d: ", d, " leng: ", this.lengthTotal)
            return false;
        }
    }

    _backward(target) {
        // Start from the end effector
        this.joints[this.joints.length - 1] = { ...target };
        for (let i = this.joints.length - 2; i >= 0; i--) {
            let r = this._distance(this.joints[i], this.joints[i + 1]);
            let lambda = this.length[i] / r;
            this.joints[i] = {
                x: (1 - lambda) * this.joints[i + 1].x + lambda * this.joints[i].x,
                y: (1 - lambda) * this.joints[i + 1].y + lambda * this.joints[i].y,
                z: (1 - lambda) * this.joints[i + 1].z + lambda * this.joints[i].z
            };
        }
    }

    _forward(start) {
        // Start from the base
        this.joints[0] = { ...start };
        for (let i = 0; i < this.joints.length - 1; i++) {
            let r = this._distance(this.joints[i], this.joints[i + 1]);
            let lambda = this.length[i] / r;
            this.joints[i + 1] = {
                x: (1 - lambda) * this.joints[i].x + lambda * this.joints[i + 1].x,
                y: (1 - lambda) * this.joints[i].y + lambda * this.joints[i + 1].y,
                z: (1 - lambda) * this.joints[i].z + lambda * this.joints[i + 1].z
            };
        }
    }

    _defineRotation_X(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var mtx = new THREE.Matrix4().set(
          1.0,       0.0,      0.0,       0.0, 
          0.0,       cosTheta, -sinTheta, 0.0, 
          0.0,       sinTheta, cosTheta,  0.0, 
          0.0,       0.0,      0.0,       1.0
        );
        return mtx;
      }
      
    _defineRotation_Y(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var mtx = new THREE.Matrix4().set(
            cosTheta,  0.0,      sinTheta,  0.0, 
            0.0,       1.0,      0.0,       0.0, 
            -sinTheta, 0.0,      cosTheta,  0.0, 
            0.0,       0.0,      0.0,       1.0
        );
        return mtx;
    }

    _defineRotation_Z(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var mtx = new THREE.Matrix4().set(
            cosTheta,  -sinTheta, 0.0,       0.0, 
            sinTheta,  cosTheta,  0.0,       0.0, 
            0.0,       0.0,       1.0,       0.0, 
            0.0,       0.0,       0.0,       1.0
        );
        return mtx;
    }

    _defineTranslation(x, y, z) {
        var mtx = new THREE.Matrix4().set(
          1.0, 0.0, 0.0, x,
          0.0, 1.0, 0.0, y,
          0.0, 0.0, 1.0, z,
          0.0, 0.0, 0.0, 1.0
        );
        return mtx;
    }

    _getPosition(mtx) {
        return new THREE.Vector3(mtx.elements[12], mtx.elements[13], mtx.elements[14]);
    }
}
