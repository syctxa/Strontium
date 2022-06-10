const print = console.log
const date = new Date()
const fs = require('fs')

const functions = require('./funcs')
const funcs = new functions()

const macros = {}
{ // Load macros
    macros.MP_PROTECT = require('./obfuscate/macros/MP_PROTECT')
    macros.MP_CRASH = require('./obfuscate/macros/MP_CRASH')
    macros.MP_JUNK = require('./obfuscate/macros/MP_JUNK')
    macros.MP_ID = require('./obfuscate/macros/MP_ID')
    macros.MP_RANDOM = require('./obfuscate/macros/MP_RANDOM')
}

const mutations = {}
{ // Load mutation handlers
    require('./obfuscate/mutations/BinaryExpression').init(mutations)
}

module.exports = function(options) {
    let start = funcs.get_mili_time()

    let stats = {
        fingerprint: funcs.randomstring(12),
        mutations: 0,
    }

    let keys = {
        fingerprint: stats.fingerprint,
        vm: Math.floor(Math.random() * 50) + 11,
        byte: Math.floor(Math.random() * 50) + 11,
    }

    let script = options.script || `do end`
    let callback = options.callback || function(a){}
    let specified_options = options.options || {}

    let state = function(body) { // Change in states
	   console.log(body)
    }

    let log = function(body, status) { // Logs

        /*
            1: SUCCESS (DEFAULT)
            2: WARNING
            3: ERROR
        */

        let func = options.log || function(){}
        func({
            body: body,
            status: status,
        })
    }

    state('Initializing')

    try { // AST Handler
        let AST = funcs.parse(script)
        state('Mapping')
        function scan(chunk) {
            Object.keys(chunk).forEach(function(v1) {
                let __chunk = chunk[v1]

                if (__chunk && typeof(__chunk) == 'object') { // Is chunk is valid
                    let type = __chunk.type

                    if (type == 'CallExpression') { // Macro being called
                        let base = __chunk.base
                        let args = __chunk.arguments
                        let func = base.name // Function name (Macro)

                        if (macros[func]) { // Is calling macro
                            let handler = macros[func].handler || function(){}
                            handler(__chunk) // Call macro with chunk data
                            log(`MACRO USED : "${func}"`)
                        }
                    }

                    if (specified_options.mutations.enabled) {
                        if (mutations[type]) { // Mutation handler
                            mutations[type].fire({
                                options: specified_options,
                                stats: stats,
                                subchunk: chunk,
                                idx: v1,
                            })
                        }
                    }

                    scan(__chunk) // Scan chunk descendants
                }
            })
        }

        scan(AST.body) // Start macro scanning

        let source = funcs.minify(AST)
        script = '' // Clear script

        Object.keys(macros).forEach(function(macro) { // For each macro, add lua function
            let macroData = macros[macro]
            let addon = macroData.addon || ``
            let static = macroData.static || `return(...)`
            script += `\n${addon}\nlocal function ${macro}(...) ${static} end\n`
        })

        script += source // Add script back
        if (options.debug) {
            fs.writeFileSync('./menprotect/ast.lua', script)
        };
    } catch (err) {
        return log(`${err.toString()}`, 3)
    }

    state('Compiling function')
    funcs.compile(script).then(function(bytecode) { // Compile script

        state('Deserializing')
        let deserialized = funcs.deserialize(bytecode) // Deserialize bytecode into a proto structure

        state('Generating stream')
        let reserialized = funcs.reserialize(deserialized, keys) // Convert proto structure into a bytecode stream

        state('Converting')
        let mp_bytecode = funcs.convertstream(reserialized.stream) // Convert bytecode stream into a string

        state('Building VM')
        let vm = funcs.build_vm({
            proto: deserialized.proto,
            instructions: deserialized.instructions,
            bytecode: mp_bytecode,
            mapping: reserialized.mapping,
        }, keys)
        state("Renamig Variables")
        let beay = funcs.beautify(vm,{RenameVariables:true})
        state("Minifying and adding memestrings")
        let vmin = funcs.luamin2(beay,{})
        state("AntiBeautify")
        function makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return `SR_${result}`;
         }
        if (specified_options.antibeautify == true) {
            let abgd = makeid(80)
            var AB= `local function getTraceback()
            local str = (function(arg)
                return debug.traceback(arg)
            end)("${abgd}");
            return str;
        end
        
        local traceback = getTraceback();
        valid = valid and traceback:sub(1, traceback:find("\n") - 1) == "${abgd}";
        local iter = traceback:gmatch(":(%d*):");
        local v, c = iter(), 1;
        for i in iter do
            valid = valid and i == v;
            c = c + 1;
        end
        valid = valid and c >= 2;`/*funcs.luamin2(funcs.beautify(`local function getTraceback()
            local str = (function(arg)
                return debug.traceback(arg)
            end)("${abgd}");
            return str;
        end
        
        local traceback = getTraceback();
        valid = valid and traceback:sub(1, traceback:find("\n") - 1) == "${abgd}";
        local iter = traceback:gmatch(":(%d*):");
        local v, c = iter(), 1;
        for i in iter do
            valid = valid and i == v;
            c = c + 1;
        end
        valid = valid and c >= 2;`,{RenameVariables:true}),{})*/
        } else {
            var AB=''
        }
        state("Markig script")
        let wts = `
--[[
                                                                                                    
            .oOOOOOo  oOOooOOOo  ooOOOoo       *Oo.    .oo     *o  oOOoooOOo  o*  o°      °o     @.  @.    
           o@@@@@@@@  @@@@@@@@@ *@@@@@@@@   .@@@@@@#   @@@#    @@  @@@@@@@@@ °@@ O@O      @@    O@O O@o    
          .@@            @@     #@*    @@o °@@O  °@@O  @@@@.  .@@     @@     #@* @@.     .@@   °@@@°@@@    
          O@O           .@@     @@     @@° @@.    °@@  @@#@@  o@O     @@     @@  @@      o@#   @@@@@@@@    
          °@@°  ##      o@#     @@  oO@@@ O@o      @@ *@O @@° @@°    *@#     @@ .@@      @@°  @@°@@@°@@*   
           *@.  @@@     @@°    °@@  @@@#  @@.     °@@ @@* O@@ @@     #@*    °@@ o@O      @@  @@O o@O o@@   
                 @@     @@     #@*  °@@   @@*     @@  @@   @@o@@     @@     O@o *@@     #@O o@@  .@  .@@   
                #@O     @@     @@    @@   *@@°  o@@°  @@   *@@@#     @@     @@.  @@#  °@@@ .@@        @@°  
         #@@@@@@@@     o@#     @@    #@O   #@°  @@.  *@#    @@@*    *@@     @@   °@@@@@@o .@@.        O@@  
         °oooooo°      .o.     o°     o°             .o.    .oo     .o.     o°     °oo°   .o°          o* 
         
]]--
_${stats.fingerprint} = "${funcs.sets.stringcom}"
${vmin}
${AB}`

        // print(funcs._2C(bytecode))
        // print(funcs._2C(mp_bytecode))
        // print(deserialized.proto)
		// print(deserialized.instructions)

        { // Return
            let time = parseFloat((funcs.get_mili_time() - start).toString().substring(0, 6))
            stats.time = time
            state('Done !')
            callback({
                stats: stats,
                script: wts,
            })
        }
    })
}
