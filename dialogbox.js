class DialogBox {
    constructor(passages, highlightIndices, msTimestamps, textFrame, fontSize) {

        // let's assign the passages we have, the highlight indices given in
        // a list of tuples, and the milliseconds per passage!
        colorMode(HSB, 360, 100, 100, 100)
        this.passages = passages
        this.highlightIndices = highlightIndices
        this.msTimestamps = msTimestamps

        // our margins for textFrame animation
        this.sideMargin = 90
        this.bottomMargin = 60
        this.topMargin = height - this.bottomMargin - 220

        // we can also load the text frame
        // the first for its original, also isolated
        this.originalTextFrame = textFrame.get(this.sideMargin, this.topMargin, width-this.sideMargin*2, height-this.topMargin-this.bottomMargin)

        // our other text frame, which will be modified and displayed
        this.textFrame = textFrame

        // our current passage index
        this.currentIndex = 0

        // our current character index
        this.characterIndex = 0

        // a cache to store our character widths.
        this.cache = {}
        this.FONT_SIZE = fontSize

        // the last time we called nextPassage() in milliseconds.
        this.lastAdvanced = 0
    }

    // advances our passage if necessary given a time
    advance(time) {
        if (this.currentIndex + 1 < this.msTimestamps.length) {
            if (time > this.msTimestamps[this.currentIndex + 1]) {
                this.nextPassage()
            }
        }
    }

    // given our text frame, margins of it, and percentage of progress, we can
    // change this.textFrame with a cache of our original text frame.
    animate(cam, scale) {
        cam.beginHUD(p5._renderer, width, height)
        // if the scale is in the line growing process (less than 0.3)...
        if (scale < 0.3) {
            // we define the scale for our line_grower() function
            let line_scale = map(scale, 0.001, 0.3, 0.001, 1)
            this.line_grower(line_scale)
        }
        // and otherwise...
        if (scale > 0.4) {
            // we define the scale for our height_grower() function
            let height_scale = map(scale, 0.3, 1, 0.001, 1)
            this.height_grower(height_scale)
        }
        cam.endHUD()
    }


    // given a certain scale, it displays the text frame from the scale of the frame
    height_grower(scale) {
        let textFrameIsolated = this.originalTextFrame
        let sideMargin = this.sideMargin
        let topMargin = this.topMargin
        let bottomMargin = this.bottomMargin
        // find the top
        let frameTop = textFrameIsolated.get(0, 0, textFrameIsolated.width, textFrameIsolated.height / 2)

        // find the bottom
        let frameBottom = textFrameIsolated.get(0, textFrameIsolated.height / 2, textFrameIsolated.width, textFrameIsolated.height / 2)

        // find the position height
        let positionY = (topMargin + (height - bottomMargin)) / 2

        // find the height of the scaled text frame
        let frameHeight = textFrameIsolated.height * scale


        // fill a white-ish color to fill the frame if it is in a good range
        if (scale > 0.5 && scale < 0.9) {
            fill(188, 2, 100, (scale - 0.7) ** -2)
            stroke(0, 0, 100, (scale - 0.7) ** -2)
            rect(sideMargin + 5, topMargin + textFrameIsolated.height * (1 - scale) / 2 + 5, textFrameIsolated.width - 10, textFrameIsolated.height * scale - 10)
        }

        // display the images

        // tint a white and alpha color
        tint(0, 0, 100, scale * 100)

        // frame top
        image(frameTop, sideMargin, positionY - frameHeight / 2, textFrameIsolated.width, frameHeight / 2)
        image(frameBottom, sideMargin, positionY, textFrameIsolated.width, frameHeight / 2)
        // image(textFrameIsolated, 0, 0)

    }


    // given a certain scale, it displays the line from te scale of the line
    line_grower(scale) {
        let sideMargin = this.sideMargin
        let topMargin = this.topMargin
        let bottomMargin = this.bottomMargin

        // make an integer called lineLength with a value of width - sideMargin*2
        let lineLength = (width - sideMargin * 2) * scale

        // make an integer called positionY = (topMargin + bottomMargin)/2,
        // the position height
        let positionY = (topMargin + (height - bottomMargin)) / 2

        // alpha is a number from map(scale, 0, 0.3, 100, 20), our alpha
        let alpha = constrain(map(scale, 0.8, 1, 100, 5), 0, 100)

        // draw a white line with an alpha of the variable alpha from position
        // (width/2-lineHeight, positionY) to position (width/2+lineHeight,
        // positionY)
        stroke(188, 20, 98, alpha)
        line(width / 2 - lineLength / 2, positionY, width / 2 + lineLength / 2, positionY)
    }


    // loads the saved box texture with transparency
    renderTextFrame(cam) {
        cam.beginHUD(p5._renderer, width, height)
        image(this.textFrame, 0, 0, width, height)
        cam.endHUD()
    }

    // renders the text in our dialog box
    renderText(font, cam) {
        cam.beginHUD(p5._renderer, width, height)

        // our current passage
        let currentPassage = this.passages[this.currentIndex]

        // our margins
        let leftMargin = this.sideMargin + 40
        let topMargin = this.topMargin + 82
        textFont(font, this.FONT_SIZE)

        // draws a 50-by-50 cross where our text bottom-left is supposed to go.
        // line(leftMargin, topMargin-50, leftMargin, topMargin+50)
        // line(leftMargin-50, topMargin, leftMargin+50, topMargin)
        // our positions
        let x = leftMargin
        let y = topMargin
        let wrap = false
        fill(0, 0, 100, 100)
        stroke(0, 0, 100, 100)
        strokeWeight(5)
        for (let i = 0; i < this.characterIndex; i++) {
            let c = currentPassage[i]

            // now we're checking if we should start highlighting or not, so
            // if i is the starting index of one of the tuples...
            for (let highlight of this.highlightIndices[this.currentIndex]) {
                if (i === highlight[0] - 1) {

                    // ...we fill with yellow...
                    fill(63, 60, 75)
                    // console.log("yellow!")
                }

                // ...and if i is the ending index...

                if (i === highlight[1]) {
                    // ...we reset our fill to white.
                    fill(0, 0, 100)
                }
            }

            if (c !== ' ') {
                text(c, x, y)
                x += this.charWidth(c) + 2
            } else {
                x += 7
            }

            // now, we can do word wrap.
            // if our current character is a space...
            if (c === ' ') {

                // ...we should find the rest of the passage...
                let restOfPassage = currentPassage.substring(i+1)

                // ...the next delimiter index...
                let nextDelimiterIndex = restOfPassage.indexOf(' ') + i+1

                // ...our current word...
                let currentWord = currentPassage.substring(i, nextDelimiterIndex)

                // ...the text width of the current word...
                let textWidthCurrentWord = this.wordWidth(currentWord)

                // ...and finally, if x plus the text width of the current
                // word is equal to an x wrap defined below, set wrap to true...
                let x_wrap = width - leftMargin
                if (x + textWidthCurrentWord > x_wrap) {
                    wrap = true
                }
            }

            // ...and, if our wrap is true, we reset x, increment y, and
            // reset wrap to false.
            if (wrap) {
                x = leftMargin
                y += textAscent() + textDescent() + 3
                wrap = false
            }
        }

        // draw "ADAM" text
        fill(188, 20, 98)
        text("A", leftMargin-25, topMargin-40)
        text("D", leftMargin-25 + this.charWidth("A"), topMargin-40)
        text("A", leftMargin-25 + this.wordWidth("AD"), topMargin-40)
        text("M", leftMargin-25 + this.wordWidth("ADA"), topMargin-40)

        cam.endHUD()
    }

    // renders our equilateral triangle given a radius
    renderEquilateralTriangle(r, cam) {

        // our equilateral triangle should only show up if we're full of
        // characters.
        if (this.characterIndex >= this.passages[this.currentIndex].length) {
            cam.beginHUD()
            push()
            translate(width-this.sideMargin-50, height-this.bottomMargin-40)
            fill(188, 20, 98, 35*sin(frameCount/20) + 50)
            noStroke()
            // strokeWeight(4)
            // this just seems to be the perfect constant
            triangle(-r/2, -sqrt(3)/(4) * r, r/2, -sqrt(3)/4 * r, 0, sqrt(3)/16 * r)
            pop()
            cam.endHUD()
        }
    }

    // update our status
    update() {

        // if our characters aren't already done skipping, we should
        // increment our character index
        let currentPassage = this.passages[this.currentIndex]
        if (this.characterIndex < currentPassage.length) {

            // the reciprocal of this increase number is actually the number
            // of frames per increase. In this case, it's 5/4.
            this.characterIndex += 4/5
        }

        // because we don't want to go a fraction over
        // currentPassage.length, we have to do a non-separate check
        if (this.characterIndex > currentPassage.length) {
            this.characterIndex = currentPassage.length
        }
    }

    // advance by a passage
    nextPassage() {
        this.currentIndex++

        // now this is deprecated, since each value in msPerPassage is
        // the time from the start
        this.lastAdvanced = millis()
        this.characterIndex = 0
    }

    /*  return the width in pixels of char using the pixels array
 */
    charWidth(char) {
        if (this.cache[char]) {
            return this.cache[char]
        } else {
            /**
             * create a graphics buffer to display a character. then determine its
             * width by iterating through every pixel. Noting that 'm' in size 18
             * font is only 14 pixels, perhaps setting the buffer to a max width of
             * FONT_SIZE is sufficient. The height needs to be a bit higher to
             * account for textDescent, textAscent. x1.5 is inexact, but should be
             * plenty.
             * @type {p5.Graphics}
             */
            let g = createGraphics(this.FONT_SIZE, this.FONT_SIZE * 1.5)
            g.colorMode(HSB, 360, 100, 100, 100)
            g.textFont(font, this.FONT_SIZE)
            g.background(0, 0, 0)
            g.fill(0, 0, 100)
            g.text(char, 0, 0)
            let maxX = 0; // our maximum x
            let d = g.pixelDensity() // our pixel density

            g.text(char, 0, textAscent())

            g.loadPixels()

            for (let x = 0; x < g.width; x++) {
                for (let y = 0; y < g.height; y++) {
                    let i = 4 * d * (y * g.width + x)
                    let redNotZero = (g.pixels[i] !== 0)
                    let greenNotZero = (g.pixels[i + 1] !== 0)
                    let blueNotZero = (g.pixels[i + 2] !== 0)
                    /**
                     * What does it mean for a pixel to be non-black?
                     * It means that one of the red, blue, or green not zeros have
                     * to be true.
                     */
                    let notBlack = redNotZero || greenNotZero || blueNotZero
                    if (notBlack) {
                        maxX = x
                        // stroke(100, 100, 100)
                        // point(x, y)
                    }
                }
            }
            this.cache[char] = maxX
            return maxX
        }
    }

    /**
     * use charWidth to find the width of more than one character
     */
    wordWidth(word) {
        let sum = 0
        let SPACE_WIDTH = this.FONT_SIZE/2
        let LETTER_SPACING = 1.25

        // add the sum of "olive" the char widths plus the word spacing. for
        // spaces, use spaceWidth.

        for (let c of word) {
            if (c === " ") {
                // we don't want to space the letters into a space.
                sum += SPACE_WIDTH - LETTER_SPACING
            } else {
                // We need to make room for the character and some spacing,
                // determined by L
                sum += this.charWidth(c) + LETTER_SPACING
            }
        }
        if (word[-1] !== " ") {
            sum -= LETTER_SPACING
        }

        return sum
    }
}