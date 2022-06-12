const fs = require("fs")

const srobf = require('./strontium')
const obfuscator = new srobf()

obfuscator.obfuscate({
    script: fs.readFileSync("./Script.lua", {encoding: "binary"}),

    callback: function(data: any) {
        console.log(data.stats)
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
