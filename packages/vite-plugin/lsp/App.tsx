// import React from 'react';
// import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';

// function App() {
//   const onChange = React.useCallback((value, viewUpdate) => {
//     console.log('value:', value);
//   }, []);
//   return (
//     <CodeMirror
//       value="console.log('hello world!');"
//       height="200px"
//       extensions={[javascript({ jsx: true })]}
//       onChange={onChange}
//     />
//   );
// }
// export default App;

import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import * as xxx from '@uiw/codemirror-theme-github'

function App() {
  const onChange = React.useCallback((value, viewUpdate) => {
    console.log('value:', value)
  }, [])
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="100vh"
      width="100vw"

      theme={xxx.githubDark}
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
    />
  )
}
export default App
