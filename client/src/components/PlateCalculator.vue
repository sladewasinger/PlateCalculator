<script setup lang="ts">
import { onMounted, ref } from 'vue'
import tinycolor from 'tinycolor2';

document.addEventListener('dblclick', function (event) {
  event.preventDefault();
}, { passive: false });

let totalWeight = ref(220);
let barbellWeight = ref(45);

type Plate = {
  weight: number;
  color: string;
  diameter: number;
}

const plates: Plate[] = [
  { weight: 45, color: 'blue', diameter: 60 },
  { weight: 35, color: '#FFC300', diameter: 50 },
  { weight: 25, color: 'green', diameter: 40 },
  { weight: 10, color: '#555', diameter: 30 },
  { weight: 5, color: 'red', diameter: 20 },
  { weight: 2.5, color: 'blue', diameter: 10 },
  { weight: 1, color: '#FFC300', diameter: 10 },
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

  function resize() {
    const width = Math.min(800, window.innerWidth - 25);

    canvas.width = width;
    canvas.height = 600;
  }

  window.addEventListener('resize', () => {
    resize();
    redrawCanvas();
  });

  resize();
  redrawCanvas();
});

function redrawCanvas() {
  const inputWeight = (Number(totalWeight.value) - barbellWeight.value) / 2;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const calculatedPlates = calculatePlates(inputWeight);
  let totalPlateWidth = 0;
  let strokeWidth = 4;
  let padding = strokeWidth + 20;

  // Calculate total width of all plates first
  for (let plate of calculatedPlates) {
    const plateWidth = Math.max(20, plate.diameter * 0.5);
    totalPlateWidth += plateWidth + padding;
  }
  totalPlateWidth -= padding; // remove the last padding

  // Calculate the starting x-coordinate based on the total width of all plates
  let x = (canvas.width - totalPlateWidth) / 2;

  // Draw the barbell
  const barHeight = 10;
  const endBarHeight = barHeight * 3;
  const barWidth = x + totalPlateWidth + padding - 10;
  const endBarWidth = Math.max(totalPlateWidth + padding * 2, 75);
  const barY = canvas.height / 2 - barHeight / 2;
  const endBarY = canvas.height / 2 - endBarHeight / 2;
  ctx.fillStyle = "#DDD";
  ctx.fillRect(0, barY, barWidth, barHeight);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.filter = "blur(2px)";
  ctx.fillRect(0, barY + barHeight / 2, barWidth, barHeight);
  ctx.filter = "none";

  // end bar
  ctx.fillStyle = "#DDD";
  ctx.fillRect(x - 25, endBarY, endBarWidth, endBarHeight);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.filter = "blur(2px)";
  ctx.fillRect(x - 25, endBarY + endBarHeight / 2, endBarWidth, endBarHeight / 2); // shadow
  ctx.filter = "none";

  // Draw the plates
  for (let plate of calculatedPlates) {
    const plateWidth = Math.max(20, plate.diameter * 0.5);
    const plateHeight = Math.max(50, plate.diameter * 3);
    const plateRadius = 5;

    const plateX = x;
    const plateY = canvas.height / 2;

    x += plateWidth + padding;

    ctx.fillStyle = plate.color;
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = strokeWidth;
    roundedRect(ctx, plateX, plateY - plateHeight / 2, plateWidth, plateHeight, plateRadius);
    ctx.stroke();

    const darkColor = tinycolor(plate.color).darken(40).toString();
    const grad = ctx.createLinearGradient(
      plateX, plateY - plateHeight / 2,
      plateX, plateY + plateHeight / 2
    );
    grad.addColorStop(0, plate.color);
    grad.addColorStop(0.3, plate.color);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    roundedRect(ctx, plateX, plateY - plateHeight / 2, plateWidth, plateHeight, plateRadius);
    ctx.fill();

    // Draw the plate weight as text
    ctx.fillStyle = '#DDD';
    ctx.font = 'bold 30px trebuchet ms';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const weightStr = plate.weight.toString();
    const textX = plateX + plateWidth / 2;
    let textY = plateY - 150;
    for (let i = 0; i < weightStr.length; i++) {
      ctx.fillText(weightStr[i], textX, textY);
      let ySpacing = 30;
      if (weightStr[i + 1] == ".") {
        ySpacing = 15;
      }
      textY += ySpacing;
    }
  }
}

function adjustWeight(amount: number) {
  totalWeight.value = Number(totalWeight.value) + amount;
  redrawCanvas();
}
</script>

<template>
  <div class="container">
    <h1>Plate Calculator</h1>
    <h3>Assuming {{ barbellWeight }}lb barbell</h3>
    <div class="input-container">
      <input type="text" v-model="totalWeight" @input="redrawCanvas" />
      <span class="unit">lbs</span>
      <div class="button-container">
        <button class="up-button" v-on:click="adjustWeight(1)">▲</button>
        <button class="down-button" v-on:click="adjustWeight(-1)">▼</button>
      </div>
    </div>
    <div class="big-buttons">
      <button class="big-button" v-on:click="adjustWeight(5)">+5</button>
      <button class="big-button" v-on:click="adjustWeight(-5)">-5</button>
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  max-width: 800px;
  padding-top: 25px;
}

canvas {
  border: 1px solid #DDD;
  box-sizing: border-box;
}

input[type=text] {
  width: 100%;
  padding: 12px 20px;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid #000;
  border-radius: 4px;
  resize: vertical;
  min-width: 400px;
  font-size: 25px;
  display: inline-block;
}

.input-container {
  position: relative;
  padding-right: 50px;
  margin: 15px 0 0 0;
  width: min(calc(100% - 25px), 800px);
}

.unit {
  font-size: 25px;
  color: #000;
  position: absolute;
  top: 50%;
  right: 70px;
  transform: translateY(-50%);
}

.input-container .button-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50px;
}

.up-button,
.down-button {
  display: block;
  width: 100%;
  height: 50%;
  font-size: 20px;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
}

.big-buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 15px;
  touch-action: manipulation;
  user-select: none;
}

.big-button {
  display: inline-block;
  min-width: 125px;
  height: 125px;
  font-size: 50px;
  border: 5px outset #DDD;
  border-radius: 50%;
  cursor: pointer;
  touch-action: manipulation
}

.big-button:hover {
  border: 5px outset rgb(92, 124, 194);
}

.big-button:active {
  border: 5px inset #DDD;
}
</style>