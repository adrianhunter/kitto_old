Deno.test('contract', async () => {

  const code = await fetch(`http://localhost:1337/test/src/P2pkh.scrypt.ts`).then(a => a.text())

  const outPath = new URL("./out/P2pkh.scrypt.js", import.meta.url)
  await Deno.writeTextFile(outPath, code)
  // await import('~/contract/Counter.scrypt.ts')


    const command = new Deno.Command(Deno.execPath(), {
      args: [
       "run", "-A", outPath.href
      ],
    })
   
    const server = command.spawn()

    await server.status
})
