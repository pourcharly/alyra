import { EthProvider } from './contexts/EthContext';
import { Routing } from './Routing';
import { EventsHandler, UserAddress } from './components';

import "./App.css";

function App() {

  return (
    <div style={{ padding: '100px 50px', display: 'flex',flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ marginBottom: '50px', fontWeight: 'bold' }}>VOTING CONTRACT</h1>
      <EthProvider>
          <UserAddress/>
          <EventsHandler/>
          <Routing/>
      </EthProvider>
    </div>
  );
}

export default App;
