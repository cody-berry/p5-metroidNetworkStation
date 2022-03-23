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



const detail = 32

// globe is going to be a two-D array...
let globe = Array(detail+1)

// ...so let's fill it!
for (let i = 0; i < globe.length; i++) {
    globe[i] = Array(detail+1)
}
// what is our angle for our Adam?
let angle = 0

// what is our amplitude?
let p5amp
let voice
let lastVoiceAmp = 0

let fontTwo


function preload() {
    font = loadFont('data/giga.ttf')
    fontTwo = loadFont('data/meiryo.ttf')
    passages = loadJSON("passages.json")
    artaria = loadSound("data/artaria.mp3")
    textFrame = loadImage("data/textFrame.png")
}

/* populate an array of passage text */
let textList = []
/* grab other information: ms spent on each passage, highlights */
let highlightList = [] // a list of tuples specifying highlights and indexes
let msEndTimestamps = [] // the time since the soundtrack started of the
// end of all the passages
let msStartTimestamps = [] // the time since the soundtrack started of the
// start of all the passages
let textFrame // our text frame
let cam // our camera


function setup() {
    createCanvas(1280, 720, WEBGL)
    cam = new Dw.EasyCam(this._renderer, {distance: 240});
    colorMode(HSB, 360, 100, 100, 100)
    textFont(fontTwo, 20)

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
        msEndTimestamps.push(passages[p]["speechEndTime"])
        msEndTimestamps.push(passages[p]["speechStartTime"])
        // console.log(msPerPassage)
    }


    // console.log(passages.length)
    // console.log(textList)
    // textFrame.resize(640, 360)
    // console.log(textFrame)
    dialogBox = new DialogBox(textList, highlightList, msStartTimestamps, msEndTimestamps, textFrame, 24)
    // console.log(textFrame)

    // define amplitude
    p5amp = new p5.Amplitude(0)

    // now we rotate the camera to make sure we're in the correct place for Adam
    cam.rotateX(-PI/2)

    // let's setup our globe
    setupGlobe()
}


function draw() {
    background(234, 34, 24)
    drawBlenderAxis()

    // let's light up the room!
    ambientLight(250)
    directionalLight(0, 0, 10, .5, 1, 0)

    // display Adam
    displayGlobe()

    angle -= 1/10

    drawTorus()

    // we should only render our text our update if we're playing. This is
    // partially why we created the playing variable anyway.
    if (playing) {
        // how long has Adam given speech for?
        // it depends on the time, so millis(). But he only starts
        // talking after the soundtrack starts and msStartTimestamps[0] is
        // exceeded, so -voiceStartMillis-msStartTimestamps[0]. We skip
        // jumpMillis ahead, but it is not included in msStartTimestamps[0], so
        // +jumpMillis.
        let howLongPlayingFor = millis() - voiceStartMillis + jumpMillis - msStartTimestamps[0]

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
        dialogBox.advance(howLongPlayingFor + msStartTimestamps[0])

        // map the milliseconds since it has started from 0 to 250 to a scale
        // for dialogBox.
        cam.beginHUD(p5._renderer, width, height)
        debugCorner()
        cam.endHUD()
    }
    // console.log(textFrame)
    dialogBox.renderTextFrame(cam)
}


// let's draw our debug corner!
function debugCorner() {
    let lineHeight = textAscent() + textDescent()
    fill(0, 0, 100)
    noStroke()
    text(`speechStarted: ${dialogBox.speechStarted()}`, 0, height)
    text(`speechEnded: ${dialogBox.speechEnded()}`, 0, height - lineHeight)
    text(`milliseconds: ${millis() - voiceStartMillis + jumpMillis - msStartTimestamps[0]}`, 0, height-2*lineHeight)
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


//-----------------------------------------------------------------------------
// SPHERICAL GEOMETRY FUNCTIONS
//-----------------------------------------------------------------------------



function setupGlobe() {
    let φ, θ, x, y, z

    // let's reset our stroke!
    stroke(0, 0, 0)
    // ...and the fill.
    fill(234, 34, 24)

    // Alright, let's fill our 2D array with PVectors!
    for (let i = 0; i < globe.length; i++) {
        // let's define our longitude here!
        // φ ranges from 0 to TAU.
        φ = map(i, 0, globe.length-1, 0, PI)
        for (let j = 0; j < globe[i].length; j++) {
            // let's define our latitude here!
            // θ ranges from 0 to PI.
            θ = map(j, 0, globe[i].length-1, 0, PI)

            // Now, we can use formulas to compute our x, our y, and our z
            // coordinates.
            x = sin(φ)*cos(θ)
            y = sin(φ)*sin(θ)
            z = cos(φ)

            // Yay! Now we can set it to globe[i][j].
            globe[i][j] = new p5.Vector(x, y, z)
        }
    }
}


// draws 2 toruses around Adam
function drawTorus() {
    translate(0, 0, -5)
    fill(0, 0, 100)
    torus(101, // radius
        2, // tube radius
        detail, // detailX
        detail, // detailY
    )
    fill(200, 100, 20)
    translate(0, 0, 10)
    torus(107, 8, detail, detail)
}


function displayGlobe() {

    let v1, v2, v3, v4
    fill(0, 0, 100)

    let inc_x = 1
    let inc_y = 1
    let max_r = 60

    for (let x_index = 0; x_index < globe.length - inc_x; x_index += inc_x) {
        for (let y_index = 0; y_index < globe[x_index].length - inc_y; y_index += inc_y) {
            v1 = globe[x_index][y_index]
            v2 = globe[x_index + inc_x][y_index]
            v3 = globe[x_index + inc_x][y_index + inc_y]
            v4 = globe[x_index][y_index + inc_y]

            // what is the average of our 4 vertices
            let avg = new p5.Vector(
                (v1.x+v2.x+v3.x+v4.x)/4,
                (v1.y+v2.y+v3.y+v4.y)/4,
                (v1.z+v2.z+v3.z+v4.z)/4
            )
            // we also want the pyramids to be randomized a bit
            avg.x += 0.01
            avg.y -= 0.01
            avg.z += 0.01

            let psf
            let distance = sqrt(avg.x*avg.x + avg.z*avg.z)
            // so what is the color?
            let fromColor = color(180, 12, 98)
            let toColor = color(184, 57, 95)
            let c = lerpColor(fromColor, toColor, distance/(max_r/100))

            // we want our angle to increase by distance*40 because we want
            // to have every square have a different angle
            angle += distance*40

            // we want to average the last amplitude with the current one
            let currentVoiceAmp = (p5amp.getLevel() + lastVoiceAmp) / 2
            lastVoiceAmp = currentVoiceAmp

            // we want our angle to increase by distance*40 because we want
            // to have every square have a different angle
            // angle += distance*40

            // so we've made our voice amplitude...we should make it have a
            // greater effect in the center and less as we get outer.
            currentVoiceAmp = 25*map(currentVoiceAmp, 0, 0.25, 0, 1)/
                ((distance*10)**1.9)

            // console.log(distance*10)
            // console.log((distance*10)**1.9)

            // console.log(currentVoiceAmp)

            // we need a radius modifier
            noStroke()
            if (distance >= max_r/100) {
                psf = 100
            } else {
                let howLongPlayingFor = millis() - voiceStartMillis - msStartTimestamps[0]
                // what is our amplitude?
                let amp = map(distance, 0, max_r/100, 10, 5)
                // currentVoiceAmp = constrain(currentVoiceAmp, 0, 30)
                // also, we want our default radius to give a smoother
                // transition from the outer-most face that is moving and
                // the inner-most face that isn't moving.
                // let's try setting the voice amplitude!

                let radius = map(amp, 5, 10, 100, 95)

                if (dialogBox.speechStarted(howLongPlayingFor) && !dialogBox.speechEnded(howLongPlayingFor)) {
                    radius -= currentVoiceAmp
                }
                psf = radius + amp * sin(2/5*angle) + amp/2
                psf = constrain(psf, 20, 100+amp)
                psf = map(psf, 20, 100, 50, 100)
                // psf = radius


                // we need to draw the base triangles
                fill(c)
                beginShape()
                vertex(v1.x * psf, v1.y * psf, v1.z * psf)
                vertex(0, 0, 0)
                vertex(v2.x * psf, v2.y * psf, v2.z * psf)
                vertex(0, 0, 0)
                vertex(v3.x * psf, v3.y * psf, v3.z * psf)
                vertex(0, 0, 0)
                vertex(v4.x * psf, v4.y * psf, v4.z * psf)
                endShape(CLOSE)
            }

            specularMaterial(223, 34, 24) // specular material reflects less light.
            // On the contrary, it lights up more.
            shininess(100)

            fill(210, 100, 20)
            beginShape()
            vertex(v1.x*psf, v1.y*psf, v1.z*psf)
            vertex(v2.x*psf, v2.y*psf, v2.z*psf)
            vertex(v3.x*psf, v3.y*psf, v3.z*psf)
            vertex(v4.x*psf, v4.y*psf, v4.z*psf)

            endShape(CLOSE)
            // we don't want a clobber effect, so let's revert our addition
            angle -= distance*40
        }
    }

    // let's add a circular background to our sphere
    fill(180, 100, 100)
    rotateX(PI/2)
    circle(0, 0, 200)
    // but also one that's a bit upward
    fill(200, 100, 20)
    strokeWeight(0.1)
    translate(0, 0, 1)
    circle(0, 0, 200)
}

