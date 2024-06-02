import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';
import Main from '../components/Main';
import Register from '../components/Register';
import './App.css';

function App() {
    
	return (
		<Router>
			<Routes>
				<Route path="/login" exact element={<Login />} />
				<Route path="/register" exact element={<Register />} />
				<Route path="/dashboard" exact element={<Dashboard />} />
				<Route path="/" exact element={<Main />} />
			</Routes>
		</Router>
	);
}

export default App;
