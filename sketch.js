let video;
let faceMesh;
let faces = [];
let triangles;
let uvCoords;
let imgOpen, imgClose; // 兩張貼圖

function preload() {
  // Initialize FaceMesh model with a maximum of one face
  faceMesh = ml5.faceMesh({ maxFaces: 1 });

  // Load the texture images for open and closed mouth states
  imgOpen = loadImage("00.png");   // 嘴巴張開
  imgClose = loadImage("01.png");  // 嘴巴閉合
}

function mousePressed() {
  // Log detected face data to the console
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);

  // Retrieve face mesh triangles and UV coordinates
  triangles = faceMesh.getTriangles();
  uvCoords = faceMesh.getUVCoords();
}

function draw() {
  // Center the 3D space to align with the canvas
  translate(-width / 2, -height / 2);
  background(0);

  // Display the video feed
  image(video, 0, 0);

  if (faces.length > 0) {
    let face = faces[0];

    // 嘴巴開合判斷
    let upperLip = face.keypoints[13];
    let lowerLip = face.keypoints[14];
    let mouthOpen = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y) > 20; // 20 可依實際情況調整

    // 根據嘴巴狀態選擇貼圖
    let img = mouthOpen ? imgOpen : imgClose;

    // Apply texture mapping to the detected face mesh
    texture(img);
    textureMode(NORMAL);
    noStroke();
    beginShape(TRIANGLES);

    // Loop through each triangle in the face mesh
    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];

      // Get the indices of the three points that form a triangle
      let [a, b, c] = tri;

      // Retrieve the corresponding 2D face keypoints
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      // Retrieve the corresponding UV coordinates for texture mapping
      let uvA = uvCoords[a];
      let uvB = uvCoords[b];
      let uvC = uvCoords[c];

      // Define the triangle with both position (x, y) and UV texture coordinates
      vertex(pointA.x, pointA.y, uvA[0], uvA[1]);
      vertex(pointB.x, pointB.y, uvB[0], uvB[1]);
      vertex(pointC.x, pointC.y, uvC[0], uvC[1]);
    }

    endShape();
  }
}
