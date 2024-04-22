// Main DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  setupModal();
  setupAccordions();
  setupDateNavigation();
  populateExercises();
  document.querySelectorAll('.exercise-block').forEach(setupExerciseBlock);
  loadWorkoutForDate(new Date()); // Load the workout for today's date on page load
  document.getElementById('addExerciseBlockBtn').addEventListener('click', function() {
    console.log('Add button clicked');
    addExerciseBlock();
  });
  document.getElementById('saveWorkoutBtn').addEventListener('click', function() {
    
  });
});



function setupModal() {
  var modal = document.getElementById('exerciseModal');
  var span = document.getElementsByClassName('close')[0];
  span.onclick = function() {
    modal.style.display = 'none';
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

function setupAccordions() {
  document.querySelectorAll('.accordion').forEach(function(accordion) {
    accordion.onclick = function() {
      this.classList.toggle('active');
      var panel = this.nextElementSibling;
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'block';
      }
    }
  });
}

function setupDateNavigation() {
  const displayDateElement = document.getElementById('displayDate');
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  let currentDate = new Date();
  const today = new Date();

  prevDayBtn.addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() - 1);
    loadWorkoutForDate(currentDate);
  });

  nextDayBtn.addEventListener('click', function() {
    const potentialNextDate = new Date(currentDate);
    potentialNextDate.setDate(currentDate.getDate() + 1);
    if (potentialNextDate <= today) {
      currentDate = potentialNextDate;
      loadWorkoutForDate(currentDate);
    }
  });

  function updateDisplayedDate() {
    displayDateElement.textContent = currentDate.toISOString().split('T')[0];
  }
  updateDisplayedDate();
}

function updateExerciseHeader(exerciseName, chooseExerciseBtn) {
  if (chooseExerciseBtn && chooseExerciseBtn.parentNode) {
    var chosenExerciseDiv = chooseExerciseBtn.parentNode.querySelector('.chosen-exercise');
    if (!chosenExerciseDiv) {
      chosenExerciseDiv = document.createElement('div');
      chosenExerciseDiv.className = 'chosen-exercise';
      chooseExerciseBtn.parentNode.insertBefore(chosenExerciseDiv, chooseExerciseBtn.nextSibling);
    }
    chosenExerciseDiv.textContent = exerciseName;
  } else {
    console.error("Button or parent node not found in DOM");
  }
}

function loadWorkoutForDate(date) {
  const displayDateElement = document.getElementById('displayDate');
  const formattedDate = date.toISOString().split('T')[0];
  displayDateElement.textContent = formattedDate;

  fetch('/load_workout/' + formattedDate)
    .then(response => response.json())
    .then(data => {
      document.querySelectorAll('.exercise-block').forEach(block => block.remove());
      if (Object.keys(data).length === 0) {
        displayNoWorkoutMessage();
      } else {
        Object.entries(data).forEach(([exerciseName, setsData]) => {
          const exerciseBlock = addExerciseBlock();
          updateExerciseHeader(exerciseName, exerciseBlock.querySelector('.chooseExerciseBtn'));
          const setsContainer = exerciseBlock.querySelector('.exercise-sets-container');
          loadSets(setsContainer, setsData);
        });
      }
    })
    .catch(error => {
      console.error('Error loading workouts:', error);
      displayLoadError();
    });
}

function displayNoWorkoutMessage() {
  const contentDiv = document.querySelector('.content');
  // Check if the message is already displayed
  if (!contentDiv.querySelector('.no-workout-message')) {
    const noWorkoutMessage = document.createElement('p');
    noWorkoutMessage.className = 'no-workout-message';
    noWorkoutMessage.textContent = 'No workouts to display for this date.';
    contentDiv.appendChild(noWorkoutMessage);
  }
}

function displayLoadError() {
  const contentDiv = document.querySelector('.content');
  contentDiv.innerHTML = '<p>Error loading workouts. Please try again later.</p>';
}

function addExerciseBlock() {
  var content = document.querySelector('.content');

  // Create new exercise block with its components
  var newBlock = document.createElement('div');
  newBlock.className = 'exercise-block';
  newBlock.innerHTML = `
    <div class="exercise-header">
      <div class="chosen-exercise"></div>
      <button class="chooseExerciseBtn">Choose an Exercise</button>
    </div>
    <div class="exercise-sets">
      <div class="exercise-sets-headers">
        <span class="set-header"></span>
        <span class="weight-header">Weight</span>
        <span class="reps-header">Reps</span>
      </div>
      <div class="exercise-sets-container"></div>
    </div>
    <button class="addSetBtn">Add Set</button>
    <button class="deleteSetBtn">Delete Set</button>
  `;
  content.appendChild(newBlock);
  
  // Setup functionality for the block
  setupExerciseBlock(newBlock);

  return newBlock;
}

// Function to populate the exercises for each body part
function populateExercises() {
  var bodyparts = document.querySelectorAll('.accordion');
  var modal = document.getElementById('exerciseModal');
  bodyparts.forEach(function(part) {
    var nextElement = part.nextElementSibling;
    if (nextElement && nextElement.classList.contains('panel')) {
      part.parentNode.removeChild(nextElement);
    }
    var panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.display = 'none';
    var exercises = getExercisesForBodypart(part.textContent.trim());
    exercises.forEach(function(exercise) {
      var exerciseBtn = document.createElement('button');
      exerciseBtn.textContent = exercise;
      exerciseBtn.addEventListener('click', function(event) {
        var chooseExerciseBtn = event.target.closest('.modal-content').querySelector('.chooseExerciseBtn');
        updateExerciseHeader(exercise, chooseExerciseBtn);
        modal.style.display = "none";
      });
      panel.appendChild(exerciseBtn);
    });
    part.parentNode.insertBefore(panel, part.nextSibling);
  });
}

// Fake data function (replace with your actual data fetch)
function getExercisesForBodypart(bodypart) {
  var exercises = {
    'Shoulders': ['Arnold Press', 'Front Raise', 'Lateral Raise', 'Rear Delt Fly', 'Shoulder Press', 'Clean and Press', 'Dumbbell Shrug', 'Face Pull', 'Military Press', 'Smitch Machine Shrug', 'Upright Row'],
    'Back': ['Bar Pullover', 'Barbell RDL', 'Row', 'Chin Up', 'Clean and Press', 'Deadlift', 'Pull Up', 'Pull Down', 'Romanian Deadlift', 'Snatch', 'Deadlift', 'Weighted Pull-up'],
    'Chest': ['Barbell Bench Press', 'Cable Crossover', 'Fly',  'Decline Bench Press',  'Decline Smitch Machine Bench', 'Dips', 'Incline Bench Press','Pec Deck Machine', 'Push up'],
    'Bicep': ['Barbell Bicep Curl', 'Hammer Curl', 'Chin up', 'Concentration Curl', 'EZ Bar Preacher Curl', 'Face Away Cable Curl', 'Preacher Machine Curl'],
    'Tricep': ['Pushdown', 'Skullcrusher', 'Cable Kickback', 'Dips', 'Kickback', 'Tricep Extension', 'Overhead Extension'],
    'Forearm': ['Reverse Barbell Curl', 'Reverse Dumbbell Curl', 'Wrist Curl'],
    'Hamstrings': ['Back Squat', 'Barbell Lunge', 'RDL', 'Bulgarian Split Squat', 'Deadlift', 'Glute Ham Raises', 'Good Morning', 'Hip Thrust','Leg Curl',],
    'Glutes': ['Back Squat', 'Front Squat', 'Lunge', 'RDL', 'Bulgarian Split Squat', 'Clean', 'Donkey Kick', 'Dumbbell RDL', 'Glute Ham Raises', 'Hip Abductor', 'Hip Adductor', 'Leg Press'],
    'Calves': ['Barbell Lunge', 'Calf Raises', 'Dumbell Lunge'],
  };
  return exercises[bodypart] || [];
}


function setupExerciseBlock(block) {
  var addSetBtn = block.querySelector('.addSetBtn');
  var deleteSetBtn = block.querySelector('.deleteSetBtn');
  var chooseExerciseBtn = block.querySelector('.chooseExerciseBtn');
  var setsContainer = block.querySelector('.exercise-sets-container');

  // If the block is already set up, don't repeat the setup
  if (block.dataset.setup) return;
  block.dataset.setup = 'true';

  // Event listener to show exercise modal
  chooseExerciseBtn.addEventListener('click', function() {
    showExerciseModal(chooseExerciseBtn);
    var modal = document.getElementById('exerciseModal');
    modal.style.display = 'block';
    var exerciseButtons = modal.querySelectorAll('.panel button');
    exerciseButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        updateExerciseHeader(this.textContent, chooseExerciseBtn);
        modal.style.display = 'none';
      });
    });
  });

  // Add new set to the block
  addSetBtn.addEventListener('click', function() {
    addSet(setsContainer);
  });

  // Delete the last set from the block
  deleteSetBtn.addEventListener('click', function() {
    deleteSet(setsContainer);
  });

  // Populate exercises for the block (if not already populated)
  if (!block.querySelector('.bodypart-container')) {
    populateExercises(block);
  }
}



function addSet(setsContainer) {
  const setNumber = setsContainer.querySelectorAll('.exercise-row').length + 1;
  const newRow = document.createElement('div');
  newRow.className = 'exercise-row';
  newRow.innerHTML = `
    <div class="set-number">Set ${setNumber}</div>
    <input type="number" class="exercise-weight" placeholder="Weight">
    <input type="number" class="exercise-reps" placeholder="Reps">
  `;

  // Append the new row to the container
  setsContainer.appendChild(newRow);
}




function deleteSet(setsContainer) {
  const allRows = setsContainer.querySelectorAll('.exercise-row');
  if (allRows.length > 1) {
    setsContainer.removeChild(allRows[allRows.length - 1]);
  }
}

function showExerciseModal(chooseExerciseBtn) {
  const modal = document.getElementById('exerciseModal');
  modal.style.display = 'block';
  const exerciseButtons = modal.querySelectorAll('.panel button');
  exerciseButtons.forEach(button => {
    button.removeEventListener('click', handleExerciseButtonClick);
    button.addEventListener('click', () => {
      handleExerciseButtonClick(button, chooseExerciseBtn);
    });
  });
}

function handleExerciseButtonClick(button, chooseExerciseBtn) {
  updateExerciseHeader(button.textContent, chooseExerciseBtn);
  const modal = document.getElementById('exerciseModal');
  modal.style.display = 'none';
}

function loadSets(setsContainer, setsData) {
  setsContainer.innerHTML = ''; // Clear existing sets
  setsData.sort((a, b) => a.set - b.set); // Sort sets by their set number if necessary
  setsData.forEach(setData => {
    const setDiv = document.createElement('div');
    setDiv.className = 'exercise-row';

    const setLabelDiv = document.createElement('div');
    setLabelDiv.className = 'exercise-set';
    setLabelDiv.textContent = `Set ${setData.set}:`;

    const weightInput = document.createElement('input');
    weightInput.type = 'text';
    weightInput.className = 'exercise-weight';
    weightInput.value = setData.weight;
    weightInput.placeholder = 'Weight';

    const repsInput = document.createElement('input');
    repsInput.type = 'text';
    repsInput.className = 'exercise-reps';
    repsInput.value = setData.reps;
    repsInput.placeholder = 'Reps';

    setDiv.appendChild(setLabelDiv);
    setDiv.appendChild(weightInput);
    setDiv.appendChild(repsInput);

    setsContainer.appendChild(setDiv);
  });
}


function addSetWithData(setsContainer, setNumber, weight, reps) {
  const newRow = document.createElement('div');
  newRow.className = 'exercise-row';
  newRow.innerHTML = `
    <div class="set-number">Set ${setNumber}</div>
    <input type="number" class="exercise-weight" value="${weight}" placeholder="Weight">
    <input type="number" class="exercise-reps" value="${reps}" placeholder="Reps">
  `;
  setsContainer.appendChild(newRow);
}











function loadWorkoutForDate(date) {
  const displayDateElement = document.getElementById('displayDate');
  displayDateElement.textContent = date.toISOString().split('T')[0];
  const formattedDate = date.toISOString().split('T')[0];
  
  fetch('/load_workout/' + formattedDate)
    .then(response => response.json())
    .then(data => {
      document.querySelectorAll('.exercise-block').forEach(block => block.remove());
      if (Object.keys(data).length > 0) {
        Object.entries(data).forEach(([exerciseName, setsData]) => {
          const exerciseBlock = addExerciseBlock();
          updateExerciseHeader(exerciseName, exerciseBlock.querySelector('.chooseExerciseBtn'));
          const setsContainer = exerciseBlock.querySelector('.exercise-sets-container');
          loadSets(setsContainer, setsData);
        });
      } else {
        
      }
    })
    .catch(error => {
      console.error('Error loading workouts:', error);
      displayLoadErrorMessage();
    });
}

function displayNoWorkoutMessage() {
  const content = document.querySelector('.content');
  const message = document.createElement('p');
  message.textContent = 'No workouts to display for this date.';
  content.appendChild(message);
}

function displayLoadErrorMessage() {
  const content = document.querySelector('.content');
  const message = document.createElement('p');
  message.textContent = 'Error loading workouts. Please try again later.';
  content.appendChild(message);
}

function loadSets(setsContainer, setsData) {
  setsContainer.innerHTML = ''; // Clear existing sets
  setsData.sort((a, b) => a.set - b.set);
  setsData.forEach(setData => {
    addSetWithData(setsContainer, setData.set, setData.weight, setData.reps);
  });
}



function setupDateNavigation() {
  const displayDateElement = document.getElementById('displayDate');
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  let currentDate = new Date();
  const today = new Date();

  const updateDisplayedDate = () => {
    displayDateElement.textContent = currentDate.toISOString().split('T')[0];
  };

  prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    loadWorkoutForDate(currentDate);
  });

  nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    if (currentDate <= today) {
      loadWorkoutForDate(currentDate);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
      alert('Cannot navigate to a future date.');
    }
  });

  updateDisplayedDate();
}



document.getElementById('saveWorkoutBtn').addEventListener('click', function() {
  var exercises = [];
  document.querySelectorAll('.exercise-block').forEach(function(block) {
    var chosenExerciseEl = block.querySelector('.chosen-exercise');
    var exerciseName = chosenExerciseEl ? chosenExerciseEl.textContent : "Exercise Not Selected";
    var sets = [];
    block.querySelectorAll('.exercise-row').forEach(function(row, index) {
      sets.push({
        set: index + 1,
        weight: row.querySelector('.exercise-weight').value,
        reps: row.querySelector('.exercise-reps').value
      });
    });
    exercises.push({name: exerciseName, sets: sets});
  });

  var saveWorkoutUrl = '/save_workout'; // Your server's URL to save the workout
  var workoutDate = new Date().toISOString().slice(0, 10); // Format the date as needed for your server

  fetch(saveWorkoutUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({date: workoutDate, exercises: exercises}),
    credentials: 'same-origin' // Include credentials if needed for authentication
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Workout saved!');
    } else {
      alert('Failed to save workout. ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to save workout. Check console for error details.');
  });
});


// Include any other additional event listeners or initialization code needed for your application