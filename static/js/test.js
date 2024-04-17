

// This function now accepts the button element itself, to update its text
function updateExerciseHeader(exerciseName, chooseExerciseBtn) {
  var chosenExerciseDiv = chooseExerciseBtn.nextElementSibling;
  if (!chosenExerciseDiv) {
    // Create the div if it doesn't exist
    chosenExerciseDiv = document.createElement('div');
    chosenExerciseDiv.className = 'chosen-exercise';
    chooseExerciseBtn.parentNode.insertBefore(chosenExerciseDiv, chooseExerciseBtn.nextSibling);
  }
  // Update the chosen exercise text
  chosenExerciseDiv.textContent = exerciseName;
}

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

function setupInitialExerciseBlock() {
  var exerciseBlock = document.querySelector('.exercise-block');
  setupExerciseBlock(exerciseBlock);
}

function setupExerciseBlock(block) {
  var addSetBtn = block.querySelector('.addSetBtn');
  var deleteSetBtn = block.querySelector('.deleteSetBtn');
  var chooseExerciseBtn = block.querySelector('.chooseExerciseBtn');
  var setsContainer = block.querySelector('.exercise-sets-container');

  // Use a flag to indicate whether the block has been set up
  if (block.dataset.setup) return;
  block.dataset.setup = 'true';

  addSetBtn.addEventListener('click', function() {
    addSet(setsContainer);
  });

  deleteSetBtn.addEventListener('click', function() {
    deleteSet(setsContainer);
  });

  chooseExerciseBtn.addEventListener('click', function() {
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

  // Setup accordion for the block
  setupAccordions(block);
  // Populate exercises for the block
  populateExercises(block.querySelector('.bodypart-container'));
}


function addSet(container) {
  var allRows = container.querySelectorAll('.exercise-row');
  var setNumber = allRows.length + 1;
  var newRow = document.createElement('div');
  newRow.className = 'exercise-row';
  newRow.innerHTML = `
    <div class="exercise-set">${setNumber}</div>
    <input type="text" class="exercise-weight" placeholder="Weight">
    <input type="text" class="exercise-reps" placeholder="Reps">
  `;
  container.appendChild(newRow);
}

function deleteSet(container) {
  var allRows = container.querySelectorAll('.exercise-row');
  if (allRows.length > 1) {
    container.removeChild(allRows[allRows.length - 1]);
  }
}

function addExerciseBlock() {
  var content = document.querySelector('.content');
  var newBlock = document.createElement('div');
  newBlock.className = 'exercise-block';
  newBlock.innerHTML = `
    <button class="chooseExerciseBtn">Choose an Exercise</button>
    <div class="exercise-header"></div>
    <div class="exercise-sets-container">
      <div class="exercise-row">
        <div class="exercise-set">1</div>
        <input type="text" class="exercise-weight" placeholder="Weight">
        <input type="text" class="exercise-reps" placeholder="Reps">
      </div>
    </div>
    <button class="addSetBtn">Add Set</button>
    <button class="deleteSetBtn">Delete Set</button>
    <div class="bodypart-container">
      <!-- All accordion buttons and panels go here -->
    </div>
  `;
  
  content.appendChild(newBlock);
  setupExerciseBlock(newBlock);
}



// Function to populate the exercises for each body part
function populateExercises() {
  var bodyparts = document.querySelectorAll('.accordion');
  bodyparts.forEach(function(part) {
    var nextElement = part.nextElementSibling;
    // Remove any existing panel to prevent duplicates
    if (nextElement && nextElement.classList.contains('panel')) {
      part.parentNode.removeChild(nextElement);
    }
    var panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.display = 'none'; // Start with the panel not displayed
    var exercises = getExercisesForBodypart(part.textContent.trim());
    exercises.forEach(function(exercise) {
      var exerciseBtn = document.createElement('button');
      exerciseBtn.textContent = exercise;
      exerciseBtn.addEventListener('click', function() {
        var chooseExerciseBtn = this.closest('.modal-content').querySelector('.chooseExerciseBtn');
        updateExerciseHeader(exercise, chooseExerciseBtn);
        modal.style.display = "none";
      });
      panel.appendChild(exerciseBtn);
    });
    // Insert the panel after the accordion button
    part.parentNode.insertBefore(panel, part.nextSibling);
  });
}

// Fake data function (replace with your actual data fetch)
function getExercisesForBodypart(bodypart) {
  var exercises = {
    'Shoulders': ['Arnold Press', 'Cable Front Raise', 'Cable Lateral Raise', 'Cable Rear Delt Fly', 'Cable Shoulder Press', 'Clean and Press', 'Dumbbell Front Raise', 'Dumbbell Lateral Raise', 'Dumbbell Rear Delt Fly', 'Dumbbell Shoulder Press', 'Dumbbell Shrug', 'Face Pull', 'Lateral Raise Machine', 'Military Press', 'Rear Delt Fly', 'Seated Lateral Raise', 'Shoulder Press Machine', 'Smith Machine Shoulder Press', 'Smitch Machine Shrug', 'Upright Row'],
    'Back': ['Bar Pullover', 'Barbell Incline Row', 'Barbell RDL', 'Barbell Row', 'Barbell Upright Row', 'Cable Row', 'Chin Up', 'Clean', 'Clean and Press', 'Deadlift', 'Dumbbell One Arm Row', 'Iso-Lateral Pulldown', 'Iso-lateral Row Machine', 'Pendlay Row', 'Pull Up', 'Pull Down', 'Romanian Deadlift', 'Rope Pull Over', 'Seated Row Machine', 'Single Arm LAt Pulldown', 'Snatch', 'Stiff Leg Deadlift', 'Sumo Deadlift', 'T-Bar Row', 'Weighted Pull-up'],
    'Chest': ['Barbell Bench Press', 'Cable Chest Press', 'Cable Crossover', 'Cable Fly (High to Low)', 'Cable Fly (Low to High)', 'Close Grip Bench Press', 'Decline Bench Press', 'Decline Dumbbell Press', 'Decline Smitch Machine Bench', 'Dips', 'Dumbbell Fly', 'Dumbbell Press', 'Incline Bench Press', 'Incline Cable press', 'Incline Dumbbell Fly', 'Incline Dumbbell Press', 'Iso-lateral Chest Press', 'Pec Deck Machine', 'Push up', 'Seated Chest Press Machine', 'Smitch Machine Bench', 'Weighted Dips'],
    'Bicep': ['Bar Cable Curl', 'Barbell Bicep Curl', 'Cable Curl', 'Cable Hammer Curl', 'Chin up', 'Concentration Curl', 'Dumbbell Preacher Curl', 'Dumbbell Bicep Curl', 'EZ Bar Preacher Curl', 'Face Away Cable Curl', 'Hammer Curl', 'Incline Dumbbell Curl', 'Preacher Machine Curl', 'Rope Hammer Curl', 'Spider Curl'],
    'Tricep': ['Bar Pushdown', 'Barbell Skullcrusher', 'Cable Kickback', 'Cable Single Arm Extension', 'Close Grip Bench Press', 'Dips', 'Dumbbell Kickback', 'Dumbbell SkullCrusher', 'Dumbbell Tricep Extension', 'EZ Bar Skull Crusher', 'Katana Extension', 'Rope Overhead Extension', 'Rope Pushdown', 'Smith Machine JM Press', 'Tricep Extension', 'Weighted Dips'],
    'Forearm': ['Reverse Barbell Curl', 'Reverse Dumbbell Curl', 'Wrist Curl'],
    'Core': ['Barbell Back Squat', 'barbell Front Squat', 'Barbell Lunge', 'Pistol Squat', 'Clean', 'Clean and Press', 'Deadlift', 'Dumbbell Lunge', 'Goblet Squat', 'Hack Squat', 'Leg Extension', 'Leg Press', 'Lunge', 'Pendulum Squat', 'Smith Machine Squat', 'Snatch', 'Sumo Deadlift'],
    'Hamstrings': ['Barbell Back Squat', 'Barbell Lunge', 'Barbell RDL', 'Bulgarian Split Squat', 'Clean', 'Deadlift', 'Donkey Kick', 'Dumbbell Lunge', 'Dumbbell RDL', 'Glute Ham Raises', 'Good Morning', 'Hip Thrust', 'Leg Curl', 'Lunge', 'Lying Leg Curl', 'Romanian Deadlift', 'Snatch', 'Stiff Leg Deadlift', 'Sumo Dadlift'],
    'Glutes': ['Barbell Back Squat', 'Barbell Front Squat', 'Barbell Lunge', 'Barbell RDL', 'Bulgarian Split Squat', 'Clean', 'Clean and Press', 'DeadLift', 'Donkey Kick', 'Dumbbell Lunge', 'Dumbbell RDL', 'Glute Ham Raises', 'Good Morning', 'Hip Abductor', 'Hip Adductor', 'hip Thrust', 'Leg Press', 'Lunge', 'Romanian Deadlift', 'Snatch', 'Stiff Leg Deadift', 'Sumo Deadlift'],
    'Calves': ['Barbell Lunge', 'Calf Raises', 'Dumbell Lunge'],
  };
  return exercises[bodypart] || [];
}


// Event listener for the button to add another exercise block
document.getElementById('addExerciseBlockBtn').addEventListener('click', addExerciseBlock);




document.getElementById('saveWorkoutBtn').addEventListener('click', function() {
  console.log('Save button clicked');
  var exercises = [];
  document.querySelectorAll('.exercise-block').forEach(function(block) {
    var exerciseName = block.querySelector('.chosen-exercise').textContent;
    var sets = [];
    block.querySelectorAll('.exercise-row').forEach(function(row) {
      sets.push({
        set: row.querySelector('.exercise-set').textContent,
        weight: row.querySelector('.exercise-weight').value,
        reps: row.querySelector('.exercise-reps').value
      });
    });
    exercises.push({name: exerciseName, sets: sets});
  });

  // Hardcode your route for testing or use a variable that holds the actual URL
  var saveWorkoutUrl = '/save_workout'; // This should be the URL to your save workout route
  var workoutDate = new Date().toISOString().slice(0, 10); // Example date in YYYY-MM-DD format

  fetch(saveWorkoutUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({date: workoutDate, exercises: exercises}),
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
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




