import { CoreProvider } from '@hackru/frontend-core';
import LINKER from './Linker';
import CONFIG from './FrontendCore.config';

function App() {
  return (
    <CoreProvider
      // logout() is a test value for now, omitting it gives an error
      Store={{
        logout: () => {
          i += 1;
          alert(i);
        },
      }}
      Linker={LINKER}
    >
      {CONFIG}
    </CoreProvider>
  );
}

export default App;
