import { useState, useEffect, useRef } from 'react';
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
  const [monthItem, setmonthItem] = useState([]);
  const [sortState, setSortState] = useState('default');
  const [currentKeyIndex, setcurrentKeyIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const [walkTime, setWalkTime] = useState("");
  const [jogTime, setJogTime] = useState("");
  const [bikeTime, setBikeTime] = useState("");

  useEffect(() => {
    fetch('month_dust.json')
      .then((response) => response.json())
      .then((jsonData) => {
        jsonData.forEach(item => {
          Object.keys(item).forEach(key => {
            if (item[key] === null) item[key] = "0";
            while (item[key].endsWith('*')) {
              item[key] = item[key].slice(0, -1);
            }
          });
        });
        setmonthItem(jsonData.map((item, i) => ({ ...item, startIndex: i })));
      })
      .catch((error) => console.error('Error loading JSON file:', error));
  }, []);

  useEffect(() => {
    setmonthItem(monthItem.map(item => {
      const newItem = { ...item };
      const value = item[keyValues[currentKeyIndex]];
      keyValues.forEach(() => {
        newItem['a'] = Math.min(3, value);
        newItem['b'] = Math.min(1, value);
        newItem['c'] = Math.min(1, value);
        newItem['d'] = value - newItem['b'] - newItem['a'] - newItem['c'];
      });
      return newItem;
    }));
  }, [currentKeyIndex]);

  let keyValues = [];
  for (let y = 2015; y <= 2024; y++) {
    for (let m = 1; m <= 12; m++) {
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

  const handleBarClick = (data) => {
    if (data && data.activeLabel) {
      setSelectedRegion(data.activeLabel);
    }
  };

  const MonthSlider = () => {
    const [selectedIndex, setSelectedIndex] = useState(currentKeyIndex);
    const intervalRef = useRef(null);

    const handleChange = (e) => setSelectedIndex(Number(e.target.value));
    const toggleAutoPlay = () => setAutoPlay(!autoPlay);

    useEffect(() => {
      setcurrentKeyIndex(selectedIndex);
    }, [selectedIndex]);

    useEffect(() => {
      if (autoPlay) {
        intervalRef.current = setInterval(() => {
          setSelectedIndex((prev) => (prev + 1) % keyValues.length);
        }, 300);
      } else {
        clearInterval(intervalRef.current);
      }
      return () => clearInterval(intervalRef.current);
    }, [autoPlay]);

    const currentValue = keyValues[selectedIndex];
    return (
      <div style={{ padding: "1rem", maxWidth: "400px" }}>
        <label>Selected Month: <strong>{currentValue}</strong></label>
        <input
          type="range"
          min="0"
          max={keyValues.length - 1}
          value={selectedIndex}
          onChange={handleChange}
          style={{ width: "100%" }}
          onMouseUp={() => setcurrentKeyIndex(selectedIndex)}
        />
        <button onClick={toggleAutoPlay}>
          {autoPlay ? "Stop Auto" : "Start Auto"}
        </button>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const original = payload[0].payload[keyValues[currentKeyIndex]];
      return (
        <div style={{ background: '#fff', padding: 10, border: '1px solid #ccc' }}>
          <p><strong>지역:</strong> {label}</p>
          <p><strong>PM2.5:</strong> {original} μg/m³ </p>
          <p><strong>간접 흡연량:</strong> 일 당 {(original / 22).toFixed(2)} 개비</p>
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
        rx={height / 2}
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

      <MonthSlider />

      <div style={{
        width: "100%",
        height: 600,
        marginTop: 20,
        marginBottom: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "2rem"
      }}>
        <ResponsiveContainer width="60%" height="100%">
          <BarChart
            data={monthItem}
            margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
            layout="vertical"
            barCategoryGap="30%"
            barGap={10}
            barSize={20}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis type="category" dataKey={"분류"} angle={-30} textAnchor="end" interval={0} />
            <XAxis type="number" domain={[0, 50]} />
            <Tooltip dataKey={keyValues[currentKeyIndex]} content={<CustomTooltip />} />
            <Bar dataKey={'a'} stackId="a" fill="#c28e00" />
            <Bar dataKey={'b'} stackId="a" fill="#a87b00" />
            <Bar dataKey={'d'} stackId="a" fill="#eeeeee" />
            <Bar dataKey={'c'} stackId="a" fill="#EE7C02" radius={[0, 10, 10, 0]}>
              <LabelList dataKey={keyValues[currentKeyIndex]} position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Right Side Panel */}
        <div style={{ flex: 1.5, textAlign: "center", marginLeft: "20px" }}>
          {selectedRegion ? (
            (() => {
              const selectedData = monthItem.find(item => item.분류 === selectedRegion);
              const dustValue = selectedData ? selectedData[keyValues[currentKeyIndex]] : null;
              const totalMinutes = (walkTime * 1) + (jogTime * 2.5) + (bikeTime * 2);
              const estimatedCigs = dustValue
                ? ((totalMinutes * dustValue) / (1440 * 22)).toFixed(2)
                : 0;

              return (
                <div>
                  <h3 style = {{fontWeight : "700", fontSize : "1.4rem",marginBottom : "8px" }}   >
                    선택한 지역: {selectedRegion}
                  </h3>
                  {dustValue && (
                    <p style={{ fontWeight: "bold", fontSize : "20px" }}>PM2.5: {dustValue} μg/m³</p>
                  )}

                  <img
                    src="/cigarimage4.jpg"
                    alt="Health Info"
                    style={{ width: "100%", maxWidth: "400px", borderRadius: "10px", marginTop: "-0px" }}
                  />

                  {/* 🆙 Moved Input Section Upward */}
                  <div style={{ marginTop: "-232px" , paddingLeft: "100px" }}>
                    <p style={{ margin: "0 0 5px 0" }}> </p>
                    <div style={{
                      display: "flex", flexDirection: "column", gap: "12px"
                    }}>
                      <label> <input type="number" value={walkTime} onChange={(e)=>{
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) { 
                          setWalkTime(value);
                        } 
                      }}
                      placeholder="분"
                      style={{ width: "80px", height :"30px" }} /></label>
                      <label> <input type="number" value={jogTime} onChange={(e) =>{
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setJogTime(value);
                      }
                    }}
                    placeholder ="분"
                    style={{ width: "80px", height :"30px" }} /></label>
                      <label> <input type="number" value={bikeTime} onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                           setBikeTime(value);
                        }
                      }}
                      placeholder="분"
                      style={{ width: "80px" , height :"30px"}} /></label>
                     
                    </div>
                  </div>

                  <div style={{ fontSize: "1.1rem", marginTop: "24px", 
                    
                    display: "flex",
                    justifyContent: "flex-start",  // for left
                    paddingLeft: "170px"            // increase to move more right
                  }}>
                     <strong>{estimatedCigs}</strong>    
                  </div>
                </div>
              );
            })()
          ) : (
            <p style={{ opacity: 0.4 }}>차트를 클릭하면 상세 정보가 나타납니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
