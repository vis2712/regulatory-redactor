if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0;
      this.c = 0; this.d = 1;
      this.e = 0; this.f = 0;
      if (init) {
        if (Array.isArray(init) || ArrayBuffer.isView(init)) {
          if (init.length === 6) {
            this.a = init[0]; this.b = init[1];
            this.c = init[2]; this.d = init[3];
            this.e = init[4]; this.f = init[5];
          } else if (init.length === 16) {
            this.a = init[0]; this.b = init[1];
            this.c = init[4]; this.d = init[5];
            this.e = init[12]; this.f = init[13];
          }
        } else if (typeof init === 'object') {
          this.a = init.a !== undefined ? init.a : 1;
          this.b = init.b !== undefined ? init.b : 0;
          this.c = init.c !== undefined ? init.c : 0;
          this.d = init.d !== undefined ? init.d : 1;
          this.e = init.e !== undefined ? init.e : 0;
          this.f = init.f !== undefined ? init.f : 0;
        }
      }
    }
    translate(tx, ty = 0) {
      const res = new DOMMatrix();
      res.a = this.a; res.b = this.b;
      res.c = this.c; res.d = this.d;
      res.e = this.a * tx + this.c * ty + this.e;
      res.f = this.b * tx + this.d * ty + this.f;
      return res;
    }
    scale(sx, sy = sx) {
      const res = new DOMMatrix();
      res.a = this.a * sx;
      res.b = this.b * sx;
      res.c = this.c * sy;
      res.d = this.d * sy;
      res.e = this.e;
      res.f = this.f;
      return res;
    }
    multiply(other) {
      const res = new DOMMatrix();
      res.a = this.a * other.a + this.c * other.b;
      res.b = this.b * other.a + this.d * other.b;
      res.c = this.a * other.c + this.c * other.d;
      res.d = this.b * other.c + this.d * other.d;
      res.e = this.a * other.e + this.c * other.f + this.e;
      res.f = this.b * other.e + this.d * other.f + this.f;
      return res;
    }
    multiplySelf(other) {
      const a = this.a * other.a + this.c * other.b;
      const b = this.b * other.a + this.d * other.b;
      const c = this.a * other.c + this.c * other.d;
      const d = this.b * other.c + this.d * other.d;
      const e = this.a * other.e + this.c * other.f + this.e;
      const f = this.b * other.e + this.d * other.f + this.f;
      this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
      return this;
    }
    preMultiplySelf(other) {
      const a = other.a * this.a + other.c * this.b;
      const b = other.b * this.a + other.d * this.b;
      const c = other.a * this.c + other.c * this.d;
      const d = other.b * this.c + other.d * this.d;
      const e = other.a * this.e + other.c * this.f + other.e;
      const f = other.b * this.e + other.d * this.f + this.f;
      this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
      return this;
    }
    invertSelf() {
      const det = this.a * this.d - this.b * this.c;
      if (Math.abs(det) < 1e-10) {
        this.a = 1; this.b = 0;
        this.c = 0; this.d = 1;
        this.e = 0; this.f = 0;
        return this;
      }
      const a = this.d / det;
      const b = -this.b / det;
      const c = -this.c / det;
      const d = this.a / det;
      const e = (this.c * this.f - this.d * this.e) / det;
      const f = (this.b * this.e - this.a * this.f) / det;
      this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
      return this;
    }
  }
  globalThis.DOMMatrix = DOMMatrix;
}

if (typeof globalThis.ImageData === 'undefined') {
  class ImageData {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  }
  globalThis.ImageData = ImageData;
}

if (typeof globalThis.Path2D === 'undefined') {
  class Path2D {
    constructor() {}
    addPath() {}
    rect() {}
    moveTo() {}
    lineTo() {}
    closePath() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
  }
  globalThis.Path2D = Path2D;
}
