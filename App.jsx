import Provider from 'contexto/Provider';
import './global.css';
import Navigation from 'navigation/Navigation';

export default function App() {
  return (
    <Provider>
      <Navigation></Navigation>
    </Provider>
  );
}
