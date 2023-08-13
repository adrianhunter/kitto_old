// import "@kitto/plugins/server.ts"

Deno.test('plugins', async () => {
  const exclude: string[] = [
    'orderedSig.ts',
    'perceptron2.ts',
    'blindEscrow.ts',
    'sighashAnyprevout.ts',
    'zeroConfForfeit.ts',

  ]
  const include: string[] = [
    // "orderedSig.ts",
    // "timeLock.ts"
    // "mast.ts",
    "P2pkh.scrypt.ts",
    // "counter.ts"
    // "perceptron2.ts"
  ]

  const proms = []

  console.time('COMPILE')

  for await (const x of Deno.readDir(new URL('./contracts', import.meta.url))) {
    if (exclude.includes(x.name))
      continue

    if (include.includes(x.name)) {
    console.log('🚀 ~ file: plugins.test.ts:8 ~ forawait ~ x:', x.name)

    proms.push(fetch(`http://localhost:1337/test/contracts/${x.name}`).then(async (a) => {
      const txt = await a.text()
      const outFile = new URL(`./out/${x.name}.js`, import.meta.url)
      await Deno.writeTextFile(outFile, txt)
    }))

  }

    // }
    // await fetch(`http://localhost:1337/test/contracts/${x.name}?scrypt`).then(async a => {
    //   const txt = await a.text()
    //   const outFile = new URL("./out/" + x.name + ".js", import.meta.url)
    //   await Deno.writeTextFile(outFile, txt)
    // })

    // if(include.includes(x.name)) {
    // const r = await fetch(`http://localhost:1337/test/contracts/${x.name}?scrypt`).then(a => a.text())

    // }
  }

  await Promise.all(proms)

  console.timeEnd('COMPILE')

  console.log('DONE!!!')

  // /**
  //  * Now start the server
  //  */
  // const command = new Deno.Command(Deno.execPath(), {
  //   args: [

  //     "run", outFile.href
  //     // "run",
  //     // "-A",
  //     // "--import-map",
  //     // "file:///Users/X/playground/demo/importMap.json",
  //     // "--location=http://localhost:8000",
  //     // "file:///Users/X/playground/demo/server.tsx",
  //   ],
  // });
  // const server = command.spawn();

  // await server.status;
  // const p = pluginKitto()

  // const r = await pluginDriver(p).transform
})
