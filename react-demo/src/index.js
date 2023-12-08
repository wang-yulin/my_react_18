import React from 'react';
import ReactDOM from 'react-dom';

function App() {
	return (
		<div>
			<Child />
		</div>
	);
}

function Child() {
	return <span>My React</span>;
}

const root = document.querySelector('#root');

ReactDOM.createRoot(root).render(<App />);

console.log(React);
// console.log(jsx);
console.log(ReactDOM);
