import { useState, useEffect, useRef, act } from 'react';
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

function App() {
	// Define state variables.
	const [monthItem, setmonthItem] = useState([]);
	const [sortState, setSortState] = useState('default');
	const [currentKeyIndex, setcurrentKeyIndex] = useState(0);
	
	const [autoPlay, setAutoPlay] = useState(false);

	useEffect(() => {
		fetch('month_dust.json')
			.then((response) => response.json())
			.then((jsonData) => {
				// Print data into console for debugging.
				console.log(jsonData);

				// transform the NULL values to 0
				jsonData.forEach(item => {
					Object.keys(item).forEach(key => {
						if (item[key] === null) {
							item[key] = "0";
						}
						// if the value ends with "*" remove it
						while (item[key].endsWith('*')) {
							item[key] = item[key].slice(0, -1);
						}
					});
				});

				console.log("transformed", jsonData);

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
				newItem['b'] = Math.min(1, value);
				newItem['c'] = Math.min(1, value);
				newItem['d'] = value - newItem['b'] - newItem['a'] - newItem['c'];
			});

			return newItem;
		}))
		
		
		console.log("currentKeyIndex", currentKeyIndex);
		console.log("currentKey", keyValues[currentKeyIndex]);
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
  		const intervalRef = useRef(null);
		const handleChange = (e) => {
			setSelectedIndex(Number(e.target.value));
		};

		const toggleAutoPlay = () => {
			setAutoPlay(!autoPlay);
		};

		useEffect (() => {
			setcurrentKeyIndex(selectedIndex);
		}, [selectedIndex]);

		useEffect(() => {
			if (autoPlay) {
			intervalRef.current = setInterval(() => {
				setSelectedIndex((prevIndex) => {
				const nextIndex = (prevIndex + 1) % keyValues.length;
				return nextIndex;
				});
			}, 300); 
			} else {
				clearInterval(intervalRef.current);
			}

			return () => clearInterval(intervalRef.current); // cleanup
		}, [autoPlay]);

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
			<button onClick={toggleAutoPlay}>
			  {autoPlay ? "Stop Auto" : "Start Auto"}
			</button>
			</div>
		);
	};


	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			console.log("payload", payload);
			const original = payload[0].payload[keyValues[currentKeyIndex]];
			return (
			<div style={{ background: '#fff', padding: 10, border: '1px solid #ccc' }}>
				<p><strong>지역:</strong> {label}</p>
				<p><strong>PM2.5 </strong> {original} μg/m³ </p>
				<p><strong>간접 흡연량:</strong> 일 당 {(original/22).toFixed(2)} 개비</p>
			</div>
			);
		}
		return null;
	};


	const CylinderBar = ({ x, y, width, height, fill }) => (
		<g>
			<defs>
			<linearGradient id="hCylinderGradient" x1="0" y1="0" x2="1" y2="0">
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
			rx={height / 2} // Rounded ends horizontally
			ry={height / 2}
			fill="url(#hCylinderGradient)"
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
			<div className="content-container" style={{ width: "100%", height: 600, marginTop: 20, marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "left" }}
			>
				<ResponsiveContainer width="60%" height="100%" >
					<BarChart
						data={monthItem}
						margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
						layout='vertical'
						barCategoryGap="30%"
						barGap={10}
						barSize={20}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<YAxis type="category" dataKey={"분류"} angle={-30} textAnchor="end" interval={0} />
						<XAxis type="number" domain={[0, 50]} />
						<Tooltip dataKey={keyValues[currentKeyIndex]} content={<CustomTooltip />}/>
						
						<Bar dataKey={'a'} stackId="a" fill="#c28e00" />
						<Bar dataKey={'b'} stackId="a" fill="#a87b00" />
						<Bar dataKey={'d'} stackId="a" fill="#eeeeee" />
						<Bar dataKey={'c'} stackId="a" fill="#EE7C02" radius={[0, 10, 10, 0]}>
							<LabelList dataKey={keyValues[currentKeyIndex]} position="right" />
						</Bar>

					</BarChart>
				</ResponsiveContainer>

				<div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
					
					{/* FIX ME */}
						
				</div>
			</div>
		</div>
	);
}
export default App;