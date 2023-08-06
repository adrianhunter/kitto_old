export default function (_DB) {
  class Database extends _DB {
    constructor(filename, mode) {
      super(filename, 'c')
    }

    prepare(sql, params) {
      const s = super.prepare(sql, params)
      const ori_get = s.get
      function all(...args) {
        const r = []
        if (args.length)
          this.bind(args)

        try {
          while (this.step()) {
            const row = ori_get.apply(s, [{}])
            r.push(row)
          }
        }
        catch (e) {
          console.error(e)
        }
        finally {
          this.finalize()
        }
        return r
      }

      function run(...args) {
        let r
        try {
          if (args.length)
            s.bind(args).step()

          else
            s.step()

          r = s.reset.apply(s, [])
        }
        catch (e) {
          console.error(e)
        }
        finally {
          s.finalize()
        }
        return r
      }
      function customGet(...args) {
        // console.log("CUSTOM GET", args);
        if (!s._mayGet) {
          const rrr = s.step()
          let final
          try {
            // if (args.length == 0) {
            //     args.push([]);
            // }
            if (rrr)
              final = ori_get.apply(s, args)
          }
          catch (e) {
            console.error(e)
          }
          finally {
            s.finalize()
          }
          return final
        }
        else {
          if (args.length == 0)
            args.push([])

          const final = ori_get.apply(s, args)
          return final
        }
      }
      const oooo = s.finalize
      function customFinal(...args) {
        return oooo.apply(s, args)
      }
      s.run = run.bind(s)
      s.all = all.bind(s)
      s.get = customGet.bind(s)
      s.finalize = customFinal.bind(s)
      return new Proxy(s, {
        get(a, b) {
          const r = a[b]
          if (typeof r == 'function') {
            return (...args) => {
              // @ts-expect-error
              const final = r.apply(a, args)
              return final
            }
          }
          return r
        },
      })
    }
  }
  return Database
}
