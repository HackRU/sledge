// import { CoreProvider } from "@hackru/frontend-core";
// import LINKER from './Linker';
// import CONFIG from './Config';

import './App.css';
import Button from './components/SampleButton';
import PastSubmissions from './components/PastSubmissions';
import AppBar from './components/AppSideBar/AppSideBar';

function App() {
  return (
    <div className="App">
      <AppBar />
      <h1>Welcome to Sledge!</h1>
      <Button
        name="Jason"
        message="Sledge is the coolest web application ever!"
      />
      <PastSubmissions />
    </div>
  );
}

export default App;
