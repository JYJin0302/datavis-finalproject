import { useState, useEffect, act } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import './App.css';

function num2cig(number){ return number/22; }

function App() {
	// Define state variables.
	const [monthItem, setmonthItem] = useState([]);
	
	useEffect(() => {
		fetch('month_dust.json')
			.then((response) => response.json())
			.then((jsonData) => {
				// Print data into console for debugging.
				console.log(jsonData);

				setmonthItem(jsonData);

			})
			.catch((error) => {
				console.error('Error loading JSON file:', error);
			});
	}, []);

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const original = payload[0].value;
			return (
			<div style={{ background: '#fff', padding: 10, border: '1px solid #ccc' }}>
				<p><strong>Name:</strong> {label}</p>
				<p><strong>Original:</strong> {original}</p>
				<p><strong>Adjusted:</strong> {original + 10}</p>
			</div>
			);
		}
		return null;
	};

	return (
		<div style={{ width: "100%", height: 800 }}>
			<h2 style={{ textAlign: "center" }}>Line Chart from JSON</h2>
			<ResponsiveContainer>
				<BarChart
					data={monthItem}
					margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
					layout='vertical'
					barCategoryGap="30%"
					barGap={10}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<YAxis type="category" dataKey={"분류"} angle={-30} textAnchor="end" interval={0} />
					<XAxis type="number" />
					<Tooltip formatter={(value) => num2cig(value)} content={<CustomTooltip />}/>
					<Bar dataKey="2015년 1월" fill="#82ca9d" barSize={30} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
export default App;