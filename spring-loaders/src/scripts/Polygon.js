'use strict';

/**
 * Polygon.
 * Create a regular polygon and provide api to compute inscribed child.
 */
class Polygon {

  constructor(radius = 100, sides = 3, depth = 0, colors) {

    this._radius = radius;
    this._sides = sides;
    this._depth = depth;
    this._colors = colors;

    this._x = 0;
    this._y = 0;

    this.rotation = 0;
    this.scale = 1;

    // Get basePolygon points straight away.
    this.points = this._getRegularPolygonPoints();
  }

  /**
   * Get the points of any regular polygon based on
   * the number of sides and radius.
   */
  _getRegularPolygonPoints() {

    let points = [];

    let i = 0;

    while (i < this._sides) {
      // Note that sin and cos are inverted in order to draw
      // polygon pointing down like: ∇
      let x = -this._radius * Math.sin(i * 2 * Math.PI / this._sides);
      let y = this._radius * Math.cos(i * 2 * Math.PI / this._sides);

      points.push({x, y});

      i++;
    }

    return points;
  }

  /**
   * Get the inscribed polygon points by calling `getInterpolatedPoint`
   * for the points (start, end) of each side.
   */
  _getInscribedPoints(points, progress) {

    let inscribedPoints = [];

    points.forEach((item, i) => {

      let start = item;
      let end = points[i + 1];

      if (!end) {
        end = points[0];
      }

      let point = this._getInterpolatedPoint(start, end, progress);

      inscribedPoints.push(point);
    });

    return inscribedPoints;
  }

  /**
   * Get interpolated point using linear interpolation
   * on x and y axis.
   */
  _getInterpolatedPoint(start, end, progress) {

    let Ax = start.x;
    let Ay = start.y;

    let Bx = end.x;
    let By = end.y;

    // Linear interpolation formula:
    // point = start + (end - start) * progress;
    let Cx = Ax + (Bx - Ax) * progress;
    let Cy = Ay + (By - Ay) * progress;

    return {
      x: Cx,
      y: Cy
    };
  }

  /**
   * Update children points array.
   */
  _getUpdatedChildren(progress) {

    let children = [];

    for (let i = 0; i < this._depth; i++) {

      // Get basePolygon points on first lap
      // then get previous child points.
      let points = children[i - 1] || this.points;

      let inscribedPoints = this._getInscribedPoints(points, progress);

      children.push(inscribedPoints);
    }

    return children;
  }

  /**
   * Render children, first update children array,
   * then loop and draw each child.
   */
  renderChildren(context, progress) {

    let children = this._getUpdatedChildren(progress);

    // child = array of points at a certain progress over the parent sides.
    children.forEach((points, i) => {

      // Draw child.
      context.beginPath();
      points.forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();


      // Set colors.
      let strokeColor = this._colors.stroke;
      let childColor = this._colors.child;

      if (strokeColor) {
        context.strokeStyle = strokeColor;
        context.stroke();
      }

      if (childColor) {
        let rgb = rebound.util.hexToRGB(childColor);

        let alphaUnit = 1 / children.length;
        let alpha = alphaUnit + (alphaUnit * i);

        let rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;

        context.fillStyle = rgba;

        // Set Shadow.
        context.shadowColor = 'rgba(0,0,0, 0.1)';
        context.shadowBlur = 10;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.fill();
      }
    });
  }

  /**
   * Render.
   */
  render(context) {

    context.save();

    context.translate(this._x, this._y);

    if (this.rotation !== 0) {
      context.rotate(rebound.MathUtil.degreesToRadians(this.rotation));
    }

    if (this.scale !== 1) {
      context.scale(this.scale, this.scale);
    }

    // Draw basePolygon.
    context.beginPath();
    this.points.forEach((point) => context.lineTo(point.x, point.y));
    context.closePath();

    // Set colors.
    let strokeColor = this._colors.stroke;
    let childColor = this._colors.base;

    if (strokeColor) {
      context.strokeStyle = strokeColor;
      context.stroke();
    }

    if (childColor) {
      context.fillStyle = childColor;
      context.fill();
    }

    context.restore();
  }
}
