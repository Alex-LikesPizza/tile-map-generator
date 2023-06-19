const canvas = document.getElementById("canvas");

const output = document.getElementById("output");

const input_sizeX = document.getElementById("size-x");
const input_sizeY = document.getElementById("size-y");
const input_value = document.getElementById("value");
const input_color = document.getElementById("color");

const toolbox = {
    "pen": document.getElementById("pen"),
    "bucket": document.getElementById("bucket"),
    "eraser": document.getElementById("eraser")
}

let valueChart = {
    0: "#FFFFFF",
    1: "#FF0000"
}

let toolSelected = "pen";
let value = +input_value.value;
let color = input_color.value;
let contentColor = getContrastColor(color);

let mousedown = false;

let build_commas = false;


let tile = [];

let map = [];

for(let i = 0; i < 100; i++){
    let row = []
    for(let j = 0; j < 100; j++){
        row[j] = 0;
    }
    map[i] = row;
}

let colorMap = [];

for(let i = 0; i < 100; i++){
    let row = []
    for(let j = 0; j < 100; j++){
        row[j] = ["#FFF", "#000"];
    }
    colorMap[i] = row;
}



window.addEventListener("pointerup", () => {mousedown = false})
window.addEventListener("keydown", (e) =>{
    if(e.key === "1"){
        changeTool("pen");
    }
    if(e.key === "2"){
        changeTool("bucket");
    }
    if(e.key === "3"){
        changeTool("eraser");
    }
    if(e.key === "w"){
        input_value.value = value + 1;
        valueUpdate();
    }
    if(e.key === "s"){
        input_value.value = value - 1;
        valueUpdate();
    }
})

input_sizeX.addEventListener("change", canvasSizeUpdate);
input_sizeY.addEventListener("change", canvasSizeUpdate);
input_value.addEventListener("change", valueUpdate);
input_color.addEventListener("change", colorUpdate);

function canvasSizeUpdate(){
    let sizeX = +input_sizeX.value;
    let sizeY = +input_sizeY.value;
    if(sizeX > 50){
        sizeX = 50;
        input_sizeX.value = 50;
    }
    else if(sizeX < 3){
        sizeX = 3;
        input_sizeX.value = 3;
    }
    if(sizeY > 50){
        sizeY = 50;
        input_sizeY.value = 50;
    }
    else if(sizeY < 3){
        sizeY = 3;
        input_sizeY.value = 3;
    }

    if(sizeX > 40){
        document.querySelector(".container").style.width = "80%";
        canvas.style.width = "90%";
    }
    else if(sizeX > 30){
        canvas.style.width = "90%";
        document.querySelector(".container").style.width = "60%";
    }
    else {
        canvas.style.width = "70%";
        document.querySelector(".container").style.width = "60%";
    }

    let html = ""
    canvas.style.gridTemplateColumns = `repeat(${sizeX}, 1fr)`;
    canvas.style.gridTemplateRows = `repeat(${sizeY}, 1fr)`;
    for(let i = 0; i < sizeY; i++){
        for(let j = 0; j < sizeX; j++){
            html += `<div id="t${i}_${j}">${map[i][j]}</div>`;
            
        }
    }
    canvas.innerHTML = html;
    for(let i = 0; i < sizeY; i++){
        let row = []
        for(let j = 0; j < sizeX; j++){
            row[j] = document.getElementById(`t${i}_${j}`); 
        }
        tile[i] = row;
        for(let j = 0; j < sizeX; j++){
            tile[i][j].addEventListener("pointerdown", () => {mousedown = true; tileSelect(i, j)})
            tile[i][j].addEventListener("pointerover", () =>{tileSelect(i, j)});

            tile[i][j].style.backgroundColor = colorMap[i][j][0];
            tile[i][j].style.color = colorMap[i][j][1];
        }
    }
}

function valueUpdate(){
    value = +input_value.value;
    if(value < -999){
        value = -999;
    }
    else if(value > 999){
        value = 999;
    }
    else if(value == null){
        value = 1;
    }

    if(valueChart[value] === undefined){
        valueChart[value] = randomColor();
    }
    color = valueChart[value];
    contentColor = getContrastColor(color);
    input_color.value = color;
    input_value.value = value;
};
//#region Color Update
function colorUpdate(){
    color = input_color.value;
    let contrastColor = getContrastColor(color);
    valueChart[value] = color;
    contentColor = contrastColor;
    for(let row = 0; row < +input_sizeY.value; row++){
        for(let col = 0; col < +input_sizeX.value; col++){
            if(map[row][col] === value){
                tile[row][col].style.backgroundColor = color;
                tile[row][col].style.color = contrastColor;
                colorMap[row][col] = [color, contrastColor];
            }
        }
    }
}
function randomColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, "0");
}

function getContrastColor(background, threshold = 5.255) {
    const backgroundLuminance = getRelativeLuminance(hexToRGB(background));
    const contrastRatio = (backgroundLuminance + 0.05) / 0.05;

    return contrastRatio >= threshold ? "#000000" : "#FFFFFF";
}
  
function hexToRGB(hex) {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
}
  
function getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
  
    const rLuminance = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLuminance = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLuminance = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
    return 0.2126 * rLuminance + 0.7152 * gLuminance + 0.0722 * bLuminance;
}
//#endregion colorUpdate

function changeTool(tool){
    if(tool == toolSelected) return;
    toolbox[toolSelected].style.opacity = "1";
    toolSelected = tool;
    toolbox[toolSelected].style.opacity = "0.7";
}


function fillTile(row, col){
    map[row][col] = +value;
    tile[row][col].innerHTML = value;

    colorMap[row][col] = [color, contentColor];
    tile[row][col].style.backgroundColor = color;
    tile[row][col].style.color = contentColor;
}
function tileSelect(row, col, bucketing){
    if(!mousedown && bucketing === undefined)return;
    if(toolSelected === "bucket"){
        if(bucketing === undefined)bucketing = map[row][col];
        let sizeX = +input_sizeX.value;
        let sizeY = +input_sizeY.value;
        
        if(row < 0 || col < 0)return;
        if(row >= sizeY || col >= sizeX)return;
        if(map[row][col] != bucketing)return;
        if(map[row][col] ===  +value)return;
        
        fillTile(row, col);

        tileSelect(row + 1, col, bucketing);
        tileSelect(row, col + 1, bucketing);
        tileSelect(row - 1, col, bucketing);
        tileSelect(row, col - 1, bucketing);
    }
    else if(toolSelected === "pen"){
        fillTile(row, col);
    }
    else if(toolSelected === "eraser"){
        map[row][col] = 0;
        tile[row][col].innerHTML = 0;

        colorMap[row][col] = ["#FFF", "#000"];
        tile[row][col].style.backgroundColor = "#FFF";
        tile[row][col].style.color = "#000";
    }
}
function addCommas(){
    if(build_commas === "no-space"){
        build_commas = true;
    }
    else if(build_commas === true){
        build_commas = false;
    }
    else{
        build_commas = "no-space";
    }
    build();
}
function build(){
    let sizeX = +input_sizeX.value;
    let sizeY = +input_sizeY.value;

    let html = "&NewLine;";
    let i;
    for(i = 0; i < sizeY; i++){
        for(let j = 0; j < sizeX; j++){
            html += map[i][j] + " ";
        }
        html += "&NewLine;"
    }
    if(build_commas)html = html.replaceAll(" ", build_commas === "no-space"? "," : ", ");
    html = html.slice(0, build_commas === true? -11 : -10);
    
    html += build_commas === true? "  " : " ";
    output.innerHTML = html;
    let fontSize;
    if(sizeX > 32) fontSize = 0.8
    else if(sizeX > 25) fontSize = 1
    else fontSize = 1.3
    output.style.fontSize = fontSize + "rem";
    output.style.height = (fontSize + 0.3 * fontSize)* i + "rem";
}
function copyText() {
    const text = output.value;
    output.select();
    navigator.clipboard.writeText(text);
}
canvasSizeUpdate();