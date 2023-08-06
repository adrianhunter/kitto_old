export const asyncify = (f: any) => { 
    return async (...args: any) => { 
        return await f(...args)
    }
}
  

