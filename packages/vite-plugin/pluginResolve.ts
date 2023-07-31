
// import type { Plugin } from 'npm:vite'
// export function pluginResolve(): Plugin {
//   return {
//     name: "kitto:resolve",

//     transform(code, id) {

//       console.log("ASDASD", id)
//     },

//    async  load(id: string) {
//       if(id.startsWith("npm:")) {

//         if(id.endsWith(".js")) {

//           const url = `https://cdn.jsdelivr.net/npm/${id.slice(4)}`
//           console.log("LOAD", url)

//           const r = await fetch(url).then(a => a.text())

//           console.log("LOADED", r)


//           return r

//         }
//       }


//     },

//     resolveId(id: string) {


//         console.log("RESOLVE", id)
//         if(id.startsWith("npm:")) {

//           if(id.endsWith(".js")) {

//             return      {

//              id:  `https://cdn.jsdelivr.net/npm/${id.slice(4)}`,

//              "external": false,

//             resolvedBy: "kitto:resolve"
             


//             }


//           }

//         }


//     }
// }
// }
