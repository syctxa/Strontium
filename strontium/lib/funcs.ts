interface setd{
    version: string,
    stringcom: string
}
module.exports = class funcs {
    xor: Function
    compile: Function
    _2C: Function
    get_mili_time: Function
    convertstream: Function
    randomstring: Function
    luamin2: Function
    beautify: Function
    tohex: Function

    minify: Function
    parse: Function
    deserialize: Function
    reserialize: Function
    build_vm : Function
    sets:  setd

    encrypt: Function
    overwrite_chunk: Function
    constructor() {
        this.xor = require('./funcs/xor')
        this.compile = require('./funcs/compile')
        this._2C = require('./funcs/_2C')
        this.get_mili_time = require('./funcs/get_mili_time')
        this.convertstream = require('./funcs/convertstream')
        this.randomstring = require('randomstring').generate
        this.luamin2 = require("./funcs/luamin2.js").Minify
        this.beautify = require("./funcs/luamin.js").Beautify
        this.tohex = function(string: string) {
            return Buffer.from(string, 'utf8').toString('hex');
        }

        this.minify = require('./funcs/minify').minify
        this.parse = require('luaparse').parse
        this.deserialize = require('./funcs/deserialize')
        this.reserialize = require('./funcs/reserialize')
        this.build_vm = require('./funcs/build_vm')
        this.sets = { version: '0.2', stringcom: 'Strontium Fork of Swagcrypt ==>discord.gg/PUBAjfDBEc<=='}

        this.encrypt = function(s:any, k:any) {
            let cs = ''
            for (let i = 0; i < s.length; i++) {
                cs += String.fromCharCode(this.xor(s.charCodeAt(i), k))
            }
            return cs
        }

        this.overwrite_chunk = function(old_chunk:any, new_chunk:any) {
            Object.keys(new_chunk).forEach(function(index) {
                let value = new_chunk[index]
                old_chunk[index] = value
            })
        }
    }
}
