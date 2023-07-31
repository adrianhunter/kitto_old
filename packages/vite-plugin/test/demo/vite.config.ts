import { defineConfig } from "vite"
import { pluginKitto } from "../../pluginKitto.ts"

export default defineConfig({
    server: {
        fs: {
            allow: ["./", "../../"]
        }
    },
    plugins: [
        pluginKitto()
    ]
})