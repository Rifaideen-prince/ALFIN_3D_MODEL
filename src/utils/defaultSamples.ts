/**
 * Sample 3D models for immediate testing and verification
 */

// Sample engineering bracket / mechanical component in OBJ format
export function generateSampleObj(): string {
  // Mechanical Flange / Bracket with mounting holes
  return `# 3D VISION Precision Engineering Bracket
# Units: mm
o Engineering_Bracket
v -25.0 -10.0 -25.0
v 25.0 -10.0 -25.0
v 25.0 -10.0 25.0
v -25.0 -10.0 25.0
v -25.0 0.0 -25.0
v 25.0 0.0 -25.0
v 25.0 0.0 25.0
v -25.0 0.0 25.0
v -15.0 0.0 -15.0
v 15.0 0.0 -15.0
v 15.0 0.0 15.0
v -15.0 0.0 15.0
v -15.0 35.0 -15.0
v 15.0 35.0 -15.0
v 15.0 35.0 15.0
v -15.0 35.0 15.0
v -6.0 35.0 -6.0
v 6.0 35.0 -6.0
v 6.0 35.0 6.0
v -6.0 35.0 6.0
v -6.0 10.0 -6.0
v 6.0 10.0 -6.0
v 6.0 10.0 6.0
v -6.0 10.0 6.0
# Base bottom
f 4 3 2 1
# Base sides
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
# Base top step
f 5 6 10 9
f 6 7 11 10
f 7 8 12 11
f 8 5 9 12
# Tower sides
f 9 10 14 13
f 10 11 15 14
f 11 12 16 15
f 12 9 13 16
# Tower top lip
f 13 14 18 17
f 14 15 19 18
f 15 16 20 19
f 16 13 17 20
# Internal cylinder / borehole
f 17 18 22 21
f 18 19 23 22
f 19 20 24 23
f 20 17 21 24
# Bottom of borehole
f 21 22 23 24
`;
}

// Sample precision calibration cube / polyhedron in ASCII STL format
export function generateSampleStl(): string {
  return `solid Calibration_Block
  facet normal 0.0 0.0 1.0
    outer loop
      vertex -15.0 -15.0 15.0
      vertex 15.0 -15.0 15.0
      vertex 15.0 15.0 15.0
    endloop
  endfacet
  facet normal 0.0 0.0 1.0
    outer loop
      vertex -15.0 -15.0 15.0
      vertex 15.0 15.0 15.0
      vertex -15.0 15.0 15.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex 15.0 15.0 -15.0
      vertex 15.0 -15.0 -15.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex -15.0 15.0 -15.0
      vertex 15.0 15.0 -15.0
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex 15.0 -15.0 -15.0
      vertex 15.0 15.0 15.0
      vertex 15.0 -15.0 15.0
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex 15.0 -15.0 -15.0
      vertex 15.0 15.0 -15.0
      vertex 15.0 15.0 15.0
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex -15.0 -15.0 15.0
      vertex -15.0 15.0 15.0
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex -15.0 15.0 15.0
      vertex -15.0 15.0 -15.0
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex -15.0 15.0 -15.0
      vertex -15.0 15.0 15.0
      vertex 15.0 15.0 15.0
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex -15.0 15.0 -15.0
      vertex 15.0 15.0 15.0
      vertex 15.0 15.0 -15.0
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex 15.0 -15.0 15.0
      vertex -15.0 -15.0 15.0
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex -15.0 -15.0 -15.0
      vertex 15.0 -15.0 -15.0
      vertex 15.0 -15.0 15.0
    endloop
  endfacet
endsolid Calibration_Block
`;
}
