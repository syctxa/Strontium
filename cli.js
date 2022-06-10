const print = console.log
const fs = require("fs")

const SwagcryptOBF = require('./strontium')
const obfuscator = new SwagcryptOBF()

obfuscator.obfuscate({
    script: fs.readFileSync("./Script.lua", {encoding: "binary"}),

    callback: function(data) {
        print(data.stats)
        fs.writeFileSync("./Out.lua", data.script)
    },
    
    options: {
        mutations: {
            enabled: true,
            max: {
                enabled: true,
                amount: 50,
            },
        },
        antibeautify: true
    },
    debug: true
})
