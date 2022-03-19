/*

@author Cody
@date 2021-12-6

version comments
    ...🌟 text list, highlight list, milliseconds per passage
    .🌟   display frame
    ..🌟  WEBGL and display it in the same place but with beginHUD() and
     endHUD()
    ...🌟 blender axis
    .🌟   p5.easyCam()
    .🌟   display a single line inside the text frame
    .🌟   word wrap
    .🌟   advancing characters
    .🌟   advancing passages using some time delay system
    .🌟   highlighting
    **    SQUIRREL!!!
*/

let font
let passages // our json file input
let dialogBox // our dialog box


// let's have our hue and default saturation
const red_hue = 0
const green_hue = 85
const blue_hue = 225
const sat = 90
const brightness_light = 60
const brightness_dark = 30

// and our endpoints
const endpoints = 10000

// adam's voice
let artaria

// is adam's voice playing?
let playing = false

// how many milliseconds we want to skip forward from time=0
let jumpMillis = 15000;

// what is the time difference of when the sketch started and the soundtrack
// started?
let voiceStartMillis = 0


function preload() {
    font = loadFont('data/giga.ttf')
    passages = loadJSON("passages.json")
    artaria = loadSound("data/artaria.mp3")
    textFrame = loadImage("data/textFrame.png")
}

/* populate an array of passage text */
let textList = []
/* grab other information: ms spent on each passage, highlights */
let highlightList = [] // a list of tuples specifying highlights and indexes
let msTimestamps = [] // how long to wait before advancing a passage
let textFrame // our text frame
let cam // our camera


function setup() {
    createCanvas(1280, 720, WEBGL)
    cam = new Dw.EasyCam(this._renderer, {distance: 240});
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 20)

    for (let p in passages) {
        textList.push(passages[p]["text"])
        // console.log(p.text)
        // console.log(p)
        let list = []
        // we can access the highlight indices for each passage
        for (let highlight of passages[p]["highlightIndices"]) {
            // for each of them, our list should extend by the list given by
            // the highlights
            list.push([highlight["start"], highlight["end"]])
        }
        highlightList.push(list)
        msTimestamps.push(passages[p]["ms"])
        // console.log(msPerPassage)
    }


    // console.log(passages.length)
    // console.log(textList)
    // textFrame.resize(640, 360)
    // console.log(textFrame)
    dialogBox = new DialogBox(textList, highlightList, msTimestamps, textFrame, 24)
    // console.log(textFrame)
}


function draw() {
    background(234, 34, 24)
    drawBlenderAxis()
    // dialogBox.renderTextFrame(cam)

    // we should only render our text our update if we're playing. This is
    // partially why we created the playing variable anyway.
    if (playing) {

        // how long has Adam given speech for?
        // it is depending on the time, so millis(). But he only starts
        // talking after the soundtrack starts and msTimestamps[0] is
        // exceeded, so -voiceStartMillis-msTimestamps[0]. We skip
        // jumpMillis ahead, but it is not included in msTimestamps[0], so
        // +jumpMillis.
        let howLongPlayingFor = millis() - voiceStartMillis + jumpMillis - msTimestamps[0]

        // and if that is greater than 0, we can show our text
        if (howLongPlayingFor > 0) {
            // we should only turn on animate() if the dialog has started,
            // and it's also not done
            if (howLongPlayingFor < 250) {
                let scale = map(howLongPlayingFor,
                    0, 250,
                    0, 1)
                dialogBox.animate(cam, scale)
            } else {
                dialogBox.renderTextFrame(cam)
            }

            dialogBox.renderText(font, cam)
            dialogBox.update()
            dialogBox.renderEquilateralTriangle(20, cam)
        }
        dialogBox.advance(howLongPlayingFor + msTimestamps[0])

        // map the milliseconds since it has started from 0 to 250 to a scale
        // for dialogBox.
    }
    // console.log(textFrame)
}


// if we press s, that means we've started
function keyPressed() {
    if (key === 's') {
        artaria.play()
        artaria.jump(jumpMillis/1000)
        playing = !playing
        voiceStartMillis = millis()
    }

    if (key === 'z') {
        noLoop()
        artaria.stop()
    }
}


// prevent the context menu from showing up :3 nya~
document.oncontextmenu = function () {
    return false;
}


// draws our blender axis
function drawBlenderAxis() {

    // red, x
    // dark
    stroke(red_hue, sat, brightness_dark)
    line(0, 0, 0, -endpoints, 0, 0)

    // light
    stroke(red_hue, sat, brightness_light)
    line(0, 0, 0, endpoints, 0, 0)

    // green, y
    // dark

    stroke(green_hue, sat, brightness_dark)
    line(0, 0, 0, 0, -endpoints, 0)

    // light
    stroke(green_hue, sat, brightness_light)
    line(0, 0, 0, 0, endpoints, 0)

    // blue, z
    // dark
    stroke(blue_hue, sat, brightness_dark)
    line(0, 0, 0, 0, 0, -endpoints)

    // light
    stroke(blue_hue, sat, brightness_light)
    line(0, 0, 0, 0, 0, endpoints)
}
