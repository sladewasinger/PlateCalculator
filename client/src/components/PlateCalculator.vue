<script setup lang="ts">
import { onMounted } from 'vue'

// define input weight
let totalWeight = 225;

type Plate = {
  weight: number;
  color: string;
  diameter: number;
}

const plates: Plate[] = [
  { weight: 45, color: 'blue', diameter: 60 },
  { weight: 35, color: 'yellow', diameter: 50 },
  { weight: 25, color: 'green', diameter: 40 },
  { weight: 10, color: 'white', diameter: 30 },
  { weight: 5, color: 'red', diameter: 20 },
  { weight: 2.5, color: 'blue', diameter: 10 },
  { weight: 1.25, color: 'yellow', diameter: 10 },
  { weight: 0.5, color: 'green', diameter: 10 },
  { weight: 0.25, color: 'white', diameter: 10 },
];

plates.sort((a, b) => b.weight - a.weight); // sort the plates from heaviest to lightest

function calculatePlates(weight: number): Plate[] {
  let result: Plate[] = [];
  for (let plate of plates) {
    while (weight >= plate.weight) {
      weight -= plate.weight;
      result.push(plate);
    }
  }
  return result;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;

  // define canvas size
  canvas.width = window.innerWidth;
  canvas.height = 600;

  redrawCanvas();
});

function redrawCanvas() {
  const inputWeight = Math.floor(Number(totalWeight) / 2);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const calculatedPlates = calculatePlates(inputWeight);
  let x = 0;
  let strokeWidth = 4;
  let padding = strokeWidth + 20;

  // Calculate barbell width first
  for (let plate of calculatedPlates) {
    const plateWidth = Math.max(20, plate.diameter * 0.5);
    x += plateWidth + padding;
  }

  // Draw the barbell bar
  const barHeight = 10;
  const barWidth = canvas.width / 2 + x;
  const barY = canvas.height / 2 - barHeight / 2;
  ctx.fillStyle = "black";
  ctx.fillRect(0, barY, barWidth, barHeight);
  ctx.fillRect(canvas.width / 2 - 25, barY - 5, x + 25, 20);

  // Reset x
  x = 0;

  // Now draw the plates
  for (let plate of calculatedPlates) {
    const plateWidth = Math.max(20, plate.diameter * 0.5);
    const plateHeight = Math.max(50, plate.diameter * 3);
    const plateRadius = 5;

    const plateX = canvas.width / 2 + x;
    const plateY = canvas.height / 2;

    x += plateWidth + padding;

    ctx.fillStyle = plate.color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = strokeWidth;
    roundedRect(ctx, plateX, plateY - plateHeight / 2, plateWidth, plateHeight, plateRadius);
    ctx.stroke();
    ctx.fill();

    // Draw the plate weight
    ctx.fillStyle = 'black';
    ctx.font = 'bold 30px trebuchet ms';
    ctx.textAlign = 'center';  // Horizontally align the text
    ctx.textBaseline = 'middle'; // Vertically align the text
    const weightStr = plate.weight.toString();
    const textX = plateX + plateWidth / 2;
    let textY = plateY - 150; // Adjust this as needed
    for (let i = 0; i < weightStr.length; i++) {
      ctx.fillText(weightStr[i], textX, textY);
      let ySpacing = 30;
      if (weightStr[i + 1] == ".") {
        ySpacing = 15;
      }
      textY += ySpacing; // Adjust this as needed
    }
  }
}
</script>

<template>
  <div class="container">
    <h1>Plate Calculator</h1>
    <input type="text" v-model="totalWeight" @input="redrawCanvas" />
    <canvas id="canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

canvas {
  border: 1px solid black;
  box-sizing: border-box;
}
</style>