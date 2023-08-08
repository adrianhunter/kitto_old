

const ignoreMods = [
"socket.io-client",
"socket.io-parser",
"@types/node",
"ts-node",
"@types/better-sqlite3",
"@types/estree",
"@types/integer",
"@types/micromatch",
"@types/uuid",
"@types/sqlstring",
"@types/format-util",

"@types/estree",


"@types/better-sqlite3",
]

function readPackage(pkg) {
    if (pkg.dependencies && pkg.dependencies["better-sqlite3"]) {
        pkg.dependencies["better-sqlite3"] = '@kitto/better-sqlite3@^1.0.0'
    }

    for (const [p, version] of Object.entries(pkg.dependencies || {})) {


        if(ignoreMods.includes(p)) {
            delete pkg.dependencies[p];
        }
        // if (pkg === 'unwanted-dependency') {
        //   delete pkg.dependencies[pkg];
        // }
    }
    return pkg
}

module.exports = {
    hooks: {
        readPackage
    }
}