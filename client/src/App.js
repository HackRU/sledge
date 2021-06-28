// import { CoreProvider } from "@hackru/frontend-core";
// import LINKER from './Linker';
// import CONFIG from './Config';

import Button from './components/SampleButton';
import HackerDashboard from './pages/HackerDashboard';

import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Welcome to Sledge!</h1>
      <Button
        name="Jason"
        message="Sledge is the coolest web application ever!"
      />
      <HackerDashboard />
    </div>
  );
}

export default App;
