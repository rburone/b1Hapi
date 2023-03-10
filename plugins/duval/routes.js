'use strict'
// const Boom   = require('@hapi/boom')
// const fs     = require('fs')
const Joi      = require('joi')

const { createCanvas, CanvasRenderingContext2D } = require('canvas')
const { polyfillPath2D } = require('path2d-polyfill')
const fs = require('fs')

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

const factSize = 10
const side     = 100
const width    = side * factSize
const height   = Math.sqrt(3*Math.pow((width/2),2))
const radius   = 10
const lblSize  = 25

const Punto = (a, b) => {
    if (Array.isArray(a)) {
        [a,b] = a
    }
    a = a * 1
    b = b * 1
    return { a, b }
}

const p = {
    A: Punto(13, 64),
    B: Punto(77, 0),
    C: Punto(13, 47),
    D: Punto(29, 31),
    E: Punto(15, 35),
    F: Punto(15, 0),
    G: Punto(13, 87),
    H: Punto(4, 46),
    I: Punto(4, 76),
    J: Punto(4, 96),
    K: Punto(2, 98),
    L: Punto(0, 80),
    M: Punto(0, 50),
    N: Punto(0, 98),
    O: Punto(29, 0)
}

const diagCode = {
    '8000'  : 'D1',
    '808080': 'D2',
    'ff0000': 'DT',
    'ffff00': 'T3',
    '800080': 'T2',
    'ff'    : 'T1',
    '202020': 'PD'
}

function processArgs(args) {
    const argsArray = args.slice(2)
    if (argsArray.length == 0) {
        // console.log('\nUSO: duval_gen coord_1 <coord_2> <coord_x>\ncoord = C2H2,CH4\n')
    }

    return argsArray
}

function tri2cart({ a, b }) {
    const x = (side - (a + (0.5 * b))) * factSize
    const y = height - (((Math.sqrt(3) / 2) * b) * factSize)

    return [x, y]
}

function segment(ctx, p1, p2, color) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1])
    ctx.lineTo(p2[0], p2[1])
    ctx.strokeStyle = color;
    ctx.stroke()
}

function mark(ctx, x, y, label) {
    const delta = radius / 2
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.arc(x - delta, y - delta, 10, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.font = `bold ${lblSize}px Arial`
    ctx.fillText(label, x + (delta * 2), y + (delta /2))
}

function drawTriangle(ctx, regions = false) {
    const colorSegments = '#000000';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, width);

    if (regions) {
        drawRegion(ctx, [p.A, p.B, Punto(100, 0), p.G], 'green')
        drawRegion(ctx, [p.A, p.B, p.O, p.D, p.C], 'gray')
        drawRegion(ctx, [p.J, p.G, p.C, p.D, p.O, p.F, p.E, p.H], 'red')
        drawRegion(ctx, [p.M, p.E, p.F, Punto(0, 0), p.M], 'yellow')
        drawRegion(ctx, [p.M, p.H, p.I, p.L], 'purple')
        drawRegion(ctx, [p.J, p.K, p.N, p.L, p.I], 'blue')
        drawRegion(ctx, [p.K, p.N, Punto(0, 100)], 'black')
    }

    segment(ctx, tri2cart(p.A), tri2cart(p.B), colorSegments)
    segment(ctx, tri2cart(p.C), tri2cart(p.D), colorSegments)
    segment(ctx, tri2cart(p.E), tri2cart(p.F), colorSegments)
    segment(ctx, tri2cart(p.E), tri2cart(p.M), colorSegments)
    segment(ctx, tri2cart(p.G), tri2cart(p.C), colorSegments)
    segment(ctx, tri2cart(p.H), tri2cart(p.J), colorSegments)
    segment(ctx, tri2cart(p.I), tri2cart(p.L), colorSegments)
    segment(ctx, tri2cart(p.D), tri2cart(p.O), colorSegments)
    segment(ctx, tri2cart(p.K), tri2cart(p.N), colorSegments)

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width / 2, 0)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.strokeStyle = colorSegments;
    ctx.stroke()
}

function drawRegion(ctx, list, color) {
    const path = new Path2D();
    for (let i = 0; i < list.length; i++) {
        const [x, y] = tri2cart(list[i]);
        if (i == 0) path.moveTo(x, y)
        else path.lineTo(x, y)
    }
    path.closePath()
    ctx.fillStyle = color;
    ctx.fill(path);
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
}

function getColPix(ctx, point) {
    const [x, y] = tri2cart(point);
    const pxc    = ctx.getImageData(x, y, 1, 1).data;
    const code   = rgbToHex(pxc[0], pxc[1], pxc[2])
    return diagCode[code]
}

function init(argv) {
    const fileName = 'test.jpg'
    const canvas   = createCanvas(width, width)
    const ctx      = canvas.getContext('2d')
    drawTriangle(ctx, true)
    let counter = 1

    argv.split(' ').forEach(coords => {
        const thePoint = Punto(coords.split(','))
        const [x, y] = tri2cart(thePoint);
        const diag = getColPix(ctx, thePoint)
        // console.log(counter, coords, diag)
        mark(ctx, x, y, counter++)
    });

    const buf = canvas.toBuffer('image/jpeg', { quality: 1 })
    return buf
}

const {string, number, boolean, array} = Joi.types();
module.exports = [
    {
        method : 'GET',
        path   : '/{coords*}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    coords: string.required()
                })
            }
        },
        handler: async function (req, h) {
            const response = init(req.params.coords)
            return h.response(response).header('Content-Disposition','inline').header('Content-type','image/jpg');
        }
    },
]
