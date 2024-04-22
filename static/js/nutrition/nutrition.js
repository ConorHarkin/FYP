document.addEventListener('DOMContentLoaded', function() {
  function calculateTotals(mealId) {
    let calsTotal = 0, carbsTotal = 0, proteinTotal = 0, fatTotal = 0;
    let table = document.getElementById(mealId);
    if (!table) return;
    let rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      let calsInput = row.querySelector('.calories');
      let carbsInput = row.querySelector('.carbs');
      let proteinInput = row.querySelector('.protein');
      let fatInput = row.querySelector('.fat');

      calsTotal += parseFloat(calsInput ? calsInput.value : 0);
      carbsTotal += parseFloat(carbsInput ? carbsInput.value : 0);
      proteinTotal += parseFloat(proteinInput ? proteinInput.value : 0);
      fatTotal += parseFloat(fatInput ? fatInput.value : 0);
    });

    let calsTotalElement = document.getElementById(`total-cals-${mealId}`);
    let carbsTotalElement = document.getElementById(`total-carbs-${mealId}`);
    let proteinTotalElement = document.getElementById(`total-protein-${mealId}`);
    let fatTotalElement = document.getElementById(`total-fat-${mealId}`);

    if (calsTotalElement) calsTotalElement.textContent = calsTotal.toFixed(2);
    if (carbsTotalElement) carbsTotalElement.textContent = carbsTotal.toFixed(2);
    if (proteinTotalElement) proteinTotalElement.textContent = proteinTotal.toFixed(2);
    if (fatTotalElement) fatTotalElement.textContent = fatTotal.toFixed(2);
  }

  function addFoodRow(mealId) {
    let table = document.getElementById(mealId);
    if (!table) return; // Ensure the table exists
    let tbody = table.querySelector('tbody');
    let newRow = tbody.insertRow(-1); // Insert a new row at the end of the tbody
    newRow.setAttribute('data-meal-type', mealId);  // Set the meal type attribute
  
    newRow.innerHTML = `
      <td><input type="text" class="food-item" placeholder="Food Item"></td>
      <td>
        <input type="number" class="amount" placeholder="Amount">
        <select class="unit">
          <option value="grams">g</option>
          <option value="milliliters">ml</option>
          <option value="ounces">oz</option>
          <option value="pounds">lbs</option>
          <option value="cups">cup</option>
          <option value="tablespoons">tbsp</option>
          <option value="teaspoons">tsp</option>
        </select>
      </td>
      <td><button type="button" class="fetch-nutrition-btn">Get Nutrition</button></td>
      <td><input type="number" readonly class="calories" placeholder="Cals"></td>
      <td><input type="number" readonly class="carbs" placeholder="Carbs (g)"></td>
      <td><input type="number" readonly class="protein" placeholder="Protein (g)"></td>
      <td><input type="number" readonly class="fat" placeholder="Fat (g)"></td>
    `;
  
    newRow.querySelector('.fetch-nutrition-btn').addEventListener('click', function() {
      const foodItem = newRow.querySelector('.food-item').value;
      const amount = newRow.querySelector('.amount').value;
      const unitSelector = newRow.querySelector('.unit');
      const unit = unitSelector.options[unitSelector.selectedIndex].value;
      fetchNutritionData(foodItem, amount, unit, newRow);  // Pass the newRow as the last parameter
    });
  
    calculateTotals(mealId); // Calculate totals to include the new row's values
    calculateGrandTotals(); // Update grand totals
  }
  

  Array.from(document.getElementsByClassName('add-food-btn')).forEach(button => {
    button.addEventListener('click', function() {
      let mealId = this.closest('.meal-section').id;
      addFoodRow(mealId);
    });
  });

  Array.from(document.querySelectorAll('.food-table input[type="number"]')).forEach(input => {
    input.addEventListener('input', function() {
      let mealId = this.closest('.meal-section').id;
      calculateTotals(mealId);
      calculateGrandTotals(); // Update grand totals
    });
  });

  const saveButton = document.getElementById('save-food-data-btn');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      const date = currentDate.toISOString().slice(0, 10); // Format YYYY-MM-DD
      const allMealData = collectAllMealData();
      saveFoodEntry(date, allMealData);
    });
  }

  function collectMealData(mealId) {
    let table = document.getElementById(mealId);
    if (!table) return [];
    let mealData = [];

    Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
      let foodInput = row.querySelector('input[type="text"]');
      let amountInput = row.querySelector('.amount');
      let caloriesInput = row.querySelector('.calories');
      let carbsInput = row.querySelector('.carbs');
      let proteinInput = row.querySelector('.protein');
      let fatInput = row.querySelector('.fat');

      let foodItem = {
        food: foodInput ? foodInput.value : '',
        amount: amountInput ? parseFloat(amountInput.value) || 0 : 0,
        calories: caloriesInput ? parseFloat(caloriesInput.value) || 0 : 0,
        carbs: carbsInput ? parseFloat(carbsInput.value) || 0 : 0,
        protein: proteinInput ? parseFloat(proteinInput.value) || 0 : 0,
        fat: fatInput ? parseFloat(fatInput.value) || 0 : 0
      };
      mealData.push(foodItem);
    });

    return mealData;
  }

  function collectAllMealData() {
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const allMealData = {};

    meals.forEach(meal => {
      allMealData[meal] = collectMealData(meal);
    });

    return allMealData;
  }

  function saveFoodEntry(date, meals) {
    fetch('/save_food_entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: date, meals: meals })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Food entry saved successfully.');
      } else {
        console.error('Failed to save food entry:', data.error);
      }
    })
    .catch(error => {
      console.error('Error saving food entry:', error);
    });
  }

  function calculateMealTotals(mealId) {
    let calsTotal = 0, carbsTotal = 0, proteinTotal = 0, fatTotal = 0;
    let mealSection = document.getElementById(mealId);
    if (!mealSection) return;

    let foodRows = mealSection.querySelectorAll('.food-row');
    foodRows.forEach(row => {
      let calsInput = row.querySelector('.calories');
      let carbsInput = row.querySelector('.carbs');
      let proteinInput = row.querySelector('.protein');
      let fatInput = row.querySelector('.fat');

      calsTotal += parseFloat(calsInput ? calsInput.value : 0);
      carbsTotal += parseFloat(carbsInput ? carbsInput.value : 0);
      proteinTotal += parseFloat(proteinInput ? proteinInput.value : 0);
      fatTotal += parseFloat(fatInput ? fatInput.value : 0);
    });

    let calsTotalElement = document.getElementById(`total-cals-${mealId}`);
    let carbsTotalElement = document.getElementById(`total-carbs-${mealId}`);
    let proteinTotalElement = document.getElementById(`total-protein-${mealId}`);
    let fatTotalElement = document.getElementById(`total-fat-${mealId}`);

    if (calsTotalElement) calsTotalElement.textContent = calsTotal.toFixed(2);
    if (carbsTotalElement) carbsTotalElement.textContent = carbsTotal.toFixed(2);
    if (proteinTotalElement) proteinTotalElement.textContent = proteinTotal.toFixed(2);
    if (fatTotalElement) fatTotalElement.textContent = fatTotal.toFixed(2);
  }

  function calculateAllMealTotals() {
    calculateMealTotals('breakfast');
    calculateMealTotals('lunch');
    calculateMealTotals('dinner');
    calculateMealTotals('snacks');
  }

  function calculateGrandTotals() {
    let calsTotalElement = document.getElementById('total-cals');
    let carbsTotalElement = document.getElementById('total-carbs');
    let proteinTotalElement = document.getElementById('total-protein');
    let fatTotalElement = document.getElementById('total-fat');

    let calsGrandTotal = 0, carbsGrandTotal = 0, fatGrandTotal = 0, proteinGrandTotal = 0;

    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealId => {
      let calsTotalElement = document.getElementById(`total-cals-${mealId}`);
      let carbsTotalElement = document.getElementById(`total-carbs-${mealId}`);
      let fatTotalElement = document.getElementById(`total-fat-${mealId}`);
      let proteinTotalElement = document.getElementById(`total-protein-${mealId}`);

      calsGrandTotal += parseFloat(calsTotalElement ? calsTotalElement.textContent : 0);
      carbsGrandTotal += parseFloat(carbsTotalElement ? carbsTotalElement.textContent : 0);
      fatGrandTotal += parseFloat(fatTotalElement ? fatTotalElement.textContent : 0);
      proteinGrandTotal += parseFloat(proteinTotalElement ? proteinTotalElement.textContent : 0);
    });

    calsTotalElement.textContent = calsGrandTotal.toFixed(2) + ' kcals';
    carbsTotalElement.textContent = carbsGrandTotal.toFixed(2) + 'g';
    proteinTotalElement.textContent = proteinGrandTotal.toFixed(2) + 'g';
    fatTotalElement.textContent = fatGrandTotal.toFixed(2) + 'g';
  }

  let currentDateString = document.getElementById('date-display').textContent;
  let currentDate = new Date(currentDateString); 

  function updateFoodEntries() {
    // Clear existing food entries
    document.querySelectorAll('.food-row').forEach(row => row.remove());

    // Fetch food entries for the current date
    fetch(`/get_food_entries?date=${currentDate.toISOString().slice(0, 10)}`)
      .then(response => response.json())
      .then(data => {
        // Populate food entries for each meal
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealId => {
          let mealEntries = data[mealId] || [];
          let tbody = document.querySelector(`#${mealId} tbody`);

          mealEntries.forEach(entry => {
            let newRow = tbody.insertRow(-1);
            newRow.classList.add('food-row');
            newRow.innerHTML = `
            
              <td><input type="text" placeholder="Food Item" value="${entry.food}"></td>
              <td><input type="number" placeholder="g or ml" class="amount" value="${entry.amount}"></td>
              <td><button type="button" class="fetch-nutrition-btn">Get Nutrition</button></td>
              <td><input type="number" placeholder="Cals" class="calories" value="${entry.calories}"></td>
              <td><input type="number" placeholder="Carbs (g)" class="carbs" value="${entry.carbs}"></td>
              <td><input type="number" placeholder="Protein (g)" class="protein" value="${entry.protein}"></td>
              <td><input type="number" placeholder="Fat (g)" class="fat" value="${entry.fat}"></td>
            `;
          });
        });

        // Calculate meal totals and grand totals
        calculateAllMealTotals();
        calculateGrandTotals();
      });
  }

  function updateDateDisplay() {
    let dateDisplay = document.getElementById('date-display');
    dateDisplay.textContent = `Food Diary for ${currentDate.toLocaleDateString()}`;
  }

  document.getElementById('prev-date-btn').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    updateFoodEntries();
  });

  document.getElementById('next-date-btn').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    updateFoodEntries();
  });


  function fetchNutritionData(foodItem, amount, unit, row) {
    const apiKey = '237f3beb703f40d5a7ab105efdf2750f';
    const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${foodItem}&apiKey=${apiKey}&number=1`;

    console.log("Searching for food item:", foodItem); // Debug log

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Search results:", data); // Debug log
            if (data.results.length > 0) {
                const foodId = data.results[0].id;
                const infoUrl = `https://api.spoonacular.com/food/ingredients/${foodId}/information?amount=${amount}&unit=${unit}&apiKey=${apiKey}`;
                console.log("Fetching nutritional info for ID:", foodId); // Debug log
                return fetch(infoUrl);
            } else {
                throw new Error('Food item not found.');
            }
        })
        .then(response => response.json())
        .then(nutritionData => {
            console.log("Nutrition data:", nutritionData); // Debug log
            updateNutritionFields(nutritionData, row);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch nutrition data: ' + error.message);
        });
}


function updateNutritionFields(nutritionData, row) {
  // Debug log to inspect what is received
  console.log("Updating fields with data:", nutritionData);

  // Assuming the API response structure is as follows:
  // nutritionData.nutrition.nutrients is an array of nutrient objects,
  // each with 'name' and 'amount' properties.
  const nutrients = nutritionData.nutrition.nutrients;

  // Extracting the relevant nutrients based on their names
  // Note: You need to ensure that the nutrient names match exactly with what the API returns
  // It could be 'Calories', 'calories', or even 'Energy' depending on the API's response
  const calories = nutrients.find(n => n.name.toLowerCase() === "calories");
  const carbs = nutrients.find(n => n.name.toLowerCase() === "carbohydrates");
  const protein = nutrients.find(n => n.name.toLowerCase() === "protein");
  const fat = nutrients.find(n => n.name.toLowerCase() === "fat");

  // Update the row with the fetched nutritional values
  // Here, it's important to check that the nutrient is found before trying to access its 'amount' property
  row.querySelector('.calories').value = calories ? calories.amount : 0;
  row.querySelector('.carbs').value = carbs ? carbs.amount : 0;
  row.querySelector('.protein').value = protein ? protein.amount : 0;
  row.querySelector('.fat').value = fat ? fat.amount : 0;

  // After updating the nutritional values, trigger recalculation of totals if required
  // This part depends on your existing 'calculateTotals' and 'calculateGrandTotals' functions
  let mealId = row.closest('.meal-section').id; // This assumes that the table row is within a section with an id
  calculateTotals(mealId);
  calculateGrandTotals();
}



document.querySelectorAll('.fetch-nutrition-btn').forEach(button => {
  button.addEventListener('click', function() {
      const row = button.closest('tr');
      const foodItem = row.querySelector('.food-item').value;
      const amount = row.querySelector('.amount').value;
      const unit = 'grams'; // or you could get this from another input or select element
      const mealId = row.closest('.meal-section').id;
      
      fetchNutritionData(foodItem, amount, unit, mealId);
  });
});



  // Update food entries and date display when the page loads
  updateFoodEntries();
  updateDateDisplay();
});

