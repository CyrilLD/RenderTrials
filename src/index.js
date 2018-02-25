import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RenderTrialsApp from './RenderTrialsApp';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<RenderTrialsApp />, document.getElementById('root'));
registerServiceWorker();
