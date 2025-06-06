import { useState, useEffect, act } from 'react';

import './App.css';


function App() {
	// Define state variables.
	const [items, setItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectedLabel, setSelectedLabel] = useState(null);
	const [selectedPrediction, setSelectedPrediction] = useState(null);
	
	useEffect(() => {
		fetch('month_dust.json')
			.then((response) => response.json())
			.then((jsonData) => {
				// Print data into console for debugging.
				console.log(jsonData);

				// Save data items to state with opacity and sizeFactor.
				setItems(jsonData.map(item => ({
					...item, opacity: 0.5, sizeFactor: 1
				})));

			})
			.catch((error) => {
				console.error('Error loading JSON file:', error);
			});
	}, []);

	// useEffect(() => {
	// 	// Update the state when selectedItem, selectedLabel, or selectedPrediction changes
	// 	// selectedItem will always be double sized and opaque
	// 	// for the rest, set opacity and sizeFactor based on selectedLabel and selectedPrediction
		
	// 	const updatedItems = items.map((item) => {
	// 		let opacity = 0.5;
	// 		let sizeFactor = 1;
	// 		const activated = selectedItem !== null || selectedLabel !== null || selectedPrediction !== null;
	// 		console.log("Actiavted: ", activated);

	// 		if (!activated) {
	// 			opacity = 0.5;
	// 			sizeFactor = 1;
	// 		}
	// 		else if (item === selectedItem) {
	// 			opacity = 1;
	// 			sizeFactor = 2;
	// 		}
	// 		else {
	// 			opacity = 0.8;
	// 			if (selectedLabel !== null && item.true_label !== selectedLabel) {
	// 				opacity = 0.1;
	// 			}
	// 			if (selectedPrediction !== null && item.predicted_label !== selectedPrediction) {
	// 				opacity = 0.1;
	// 			}
	// 			if (selectedLabel === null && selectedPrediction === null) {
	// 				opacity = 0.1;
	// 			}
	// 		}	

	// 		return { ...item, opacity, sizeFactor };
	// 	});
	// 	setItems(updatedItems);

	// }
	// , [selectedItem, selectedLabel, selectedPrediction]);
    
	return (
		<>


		</>
	);
}
export default App;