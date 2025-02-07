export default function compareVersions(versionA, versionB) {
  const vA = versionA.split(".").map((num) => parseInt(num, 10));
  const vB = versionB.split(".").map((num) => parseInt(num, 10));

  for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
    const diff = (vA[i] || 0) - (vB[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}
