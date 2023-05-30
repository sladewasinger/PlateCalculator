<script setup lang="ts">
import { onMounted, ref } from 'vue'

document.addEventListener('dblclick', function (event) {
  event.preventDefault();
}, { passive: false });

// define input weight
let totalWeight = ref(230);

type Plate = {
  weight: number;
  color: string;
  diameter: number;
}

const plates: Plate[] = [
  { weight: 45, color: 'blue', diameter: 60 },
  { weight: 35, color: '#FFC300', diameter: 50 }, // dark yellow 
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
      console.log("Before", weight);
      weight -= plate.weight;
      console.log("After", weight, plate.weight);
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
    const input = (document.getElementsByClassName('input-container') as HTMLCollectionOf<Element>)[0];
    const bigButtons = (document.getElementsByClassName('big-buttons') as HTMLCollectionOf<Element>)[0];
    const width = Math.min(800, window.innerWidth - 25);

    input.setAttribute('style', `width: ${width}px;`);
    bigButtons.setAttribute('style', `width: ${width}px;`);
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
  const inputWeight = (Number(totalWeight.value) - 45) / 2;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Clear the canvas
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

  // Calculate the starting x-coordinate based on the total width of all plates
  let x = (canvas.width - totalPlateWidth) / 2;

  // Draw the barbell bar
  const barHeight = 10;
  const barWidth = x + totalPlateWidth;
  const barY = canvas.height / 2 - barHeight / 2;
  ctx.fillStyle = "#DDD";
  ctx.fillRect(0, barY, barWidth, barHeight);
  ctx.fillRect(x - 25, barY - 5, Math.max(totalPlateWidth + 25, 75), 20);

  // Now draw the plates
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
    ctx.fill();

    // Draw the plate weight
    ctx.fillStyle = '#DDD';
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

function adjust(amount: number) {
  totalWeight.value = Number(totalWeight.value) + amount;
  redrawCanvas();
}
</script>

<template>
  <div class="container">
    <h1>Plate Calculator</h1>
    <h3>Assuming 45lb barbell</h3>
    <div class="input-container">
      <input type="text" v-model="totalWeight" @input="redrawCanvas" />
      <span class="unit">lbs</span>
      <div class="button-container">
        <button class="up-button" v-on:click="adjust(1)">▲</button>
        <button class="down-button" v-on:click="adjust(-1)">▼</button>
      </div>
    </div>
    <div class="big-buttons">
      <button class="big-up-button" v-on:click="adjust(5)">+5</button>
      <button class="big-down-button" v-on:click="adjust(-5)">-5</button>
      <!-- <span class="spacer"></span>
      <button class="big-up-button" v-on:click="adjust(2.5)">+2.5</button>
      <button class="big-down-button" v-on:click="adjust(-2.5)">-2.5</button> -->
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
  height: 100vh;
  width: 100vw;
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
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-width: 400px;
  font-size: 25px;
  display: inline-block;
}

.unit {
  font-size: 25px;
  margin-left: -10px;
}

.input-container {
  position: relative;
  padding-right: 50px;
  margin: 15px 0 0 0;
}

.unit {
  position: absolute;
  top: 50%;
  right: 70px;
  transform: translateY(-50%);
}

.button-container {
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
}

.big-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 15px;
}

.big-up-button,
.big-down-button {
  display: inline-block;
  min-width: 150px;
  height: 100px;
  font-size: 50px;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: pointer;
  touch-action: manipulation
}
</style>