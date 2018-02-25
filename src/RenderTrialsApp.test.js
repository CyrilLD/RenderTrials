import React from 'react';
import ReactDOM from 'react-dom';
import RenderTrialsApp from './RenderTrialsApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RenderTrialsApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
