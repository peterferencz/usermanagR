exports.log = (message, type) => {
    if(type.toUpperCase() == "ERROR"){
        console.log(`\x1b[31m${message}\x1b[0m`)
        process.exit(1)
    }
    console.log(`[${type.toUpperCase()}] ${message}`)
}