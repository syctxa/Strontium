import fs from 'fs'

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
    platform: 'lua/luau/roblox/Rlua/glua/lua5,1/lua5.2+',
    debug: true
})
