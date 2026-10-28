import { BufferGeometry, Float32BufferAttribute } from "three";

/** Bake a static primitive's matrix without overflowing Meshopt's quantized accessors. */
export function furnitureGeometry(source, matrix) {
  const expanded = source.index ? source.toNonIndexed() : source;
  const result = new BufferGeometry();
  for (const name of ["position", "normal"]) {
    const attribute = expanded.getAttribute(name);
    if (!attribute) continue;
    const values = new Float32Array(attribute.count * 3);
    for (let i = 0; i < attribute.count; i++) {
      values[i * 3] = attribute.getX(i);
      values[i * 3 + 1] = attribute.getY(i);
      values[i * 3 + 2] = attribute.getZ(i);
    }
    result.setAttribute(name, new Float32BufferAttribute(values, 3));
  }
  if (!result.getAttribute("normal")) result.computeVertexNormals();
  result.applyMatrix4(matrix);
  if (expanded !== source) expanded.dispose();
  return result;
}
