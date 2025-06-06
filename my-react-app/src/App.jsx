import { useState, useEffect, act } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import './App.css';

function num2cig(number){ return number/22; }

function App() {
	// Define state variables.
	const [monthItem, setmonthItem] = useState([]);
	const [sortState, setSortState] = useState('default');
	const [currentKeyIndex, setcurrentKeyIndex] = useState(0);

	useEffect(() => {
		fetch('month_dust.json')
			.then((response) => response.json())
			.then((jsonData) => {
				// Print data into console for debugging.
				console.log(jsonData);

				setmonthItem(jsonData.map((item, i) => ({
					...item, startIndex : i,
				})));

			})
			.catch((error) => {
				console.error('Error loading JSON file:', error);
			});
	}, []);


	useEffect(() => {
		console.log(monthItem);
		setmonthItem(monthItem.map(item => {
			const newItem = { ...item };
			const value = item[keyValues[currentKeyIndex]];
			keyValues.forEach(key => {
				newItem['a'] = Math.min(3, value);
				newItem['b'] = Math.min(5, value);
				newItem['c'] = value - newItem['b'] - newItem['a'];
			});

			return newItem;
		}))

		console.log("update", monthItem);

	}, [currentKeyIndex]);

	let keyValues = [];
	for (let y = 2015; y <= 2024; y++){
		for (let m = 1; m <= 12; m++){
			keyValues.push(`${y}년 ${m}월`);
		}
	}


	const handleSort = () => {
		let sorted;
		if (!sortState || sortState === 'asc') {
			sorted = [...monthItem].sort((a, b) => a.startIndex - b.startIndex);
			setSortState('default');
		} else if (sortState === 'default') {
			sorted = [...monthItem].sort((a, b) => b[keyValues[currentKeyIndex]] - a[keyValues[currentKeyIndex]]);
			setSortState('desc');
		} else {
			sorted = [...monthItem].sort((a, b) => a[keyValues[currentKeyIndex]] - b[keyValues[currentKeyIndex]]);
			setSortState('asc');
		}
		setmonthItem(sorted);
	};
	const getSortLabel = () => {
		if (sortState === 'asc') return 'Sort: Ascending';
		if (sortState === 'desc') return 'Sort: Descending';
		return 'Sort: Default';
	};


	const MonthSlider = () => {

		const [selectedIndex, setSelectedIndex] = useState(currentKeyIndex);
		const handleChange = (e) => {
			setSelectedIndex(Number(e.target.value));
		};

		const currentValue = keyValues[selectedIndex];
		return (
			<div style={{ padding: "1rem", maxWidth: "400px" }}>
			<label>
				Selected Month: <strong>{currentValue}</strong>
			</label>
			<input
				type="range"
				min="0"
				max={keyValues.length - 1}
				value={selectedIndex}
				onChange={handleChange}
				style={{ width: "100%" }}
				onMouseUp={() => {setcurrentKeyIndex(selectedIndex)}}
			/>
			</div>
		);
	};


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

	const CylinderBar = ({ x, y, width, height, fill }) => (
		<g>
			<defs>
			<linearGradient id="cylinderGradient" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor={fill} stopOpacity="0.8" />
				<stop offset="50%" stopColor={fill} stopOpacity="1" />
				<stop offset="100%" stopColor={fill} stopOpacity="0.8" />
			</linearGradient>
			</defs>
			<rect
			x={x}
			y={y}
			width={width}
			height={height}
			rx={width / 2}  // ← round corners = pill shape
			ry={width / 2}
			fill="url(#cylinderGradient)"
			/>
		</g>
	);

	return (
		
		<div style={{ width: "100%", height: 800 }}>
			<button onClick={handleSort} style={{ marginLeft: 10 }}>
				{getSortLabel()}
			</button>

			

			<h2 style={{ textAlign: "center" }}>Line Chart from JSON</h2>
			<MonthSlider>	</MonthSlider>
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
					<XAxis type="number" domain={[0, 50]} hide />
					<Tooltip formatter={(value) => num2cig(value)} content={<CustomTooltip />}/>
					<Bar dataKey={'a'} stackId="a" fill="#f8e4b3" radius={[10, 0, 0, 10]} shape={<CylinderBar />}/>
					<Bar dataKey={'b'} stackId="a" fill="#f8e4b3" radius={[10, 0, 0, 10]} />
  					<Bar dataKey={'c'} stackId="a" fill="#d26b26" radius={[0, 10, 10, 0]}>
						<LabelList dataKey={keyValues[currentKeyIndex]} position="right" />
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
export default App;