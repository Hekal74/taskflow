import React from 'react';

interface AppProps {
  name: string;
}

const App: React.FC<AppProps> = ({ name }) => {
  return <div>Hello, {name}!</div>;
};

export default App;