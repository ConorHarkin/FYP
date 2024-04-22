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