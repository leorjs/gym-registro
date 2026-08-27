export type WorkoutGuideGymRecord = {
  slug: string;
  name: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  exerciseType: string;
};

// Curated from bryllim/workout-guide commit aac599224bb9780305239607ef98540b7e0ce389.
// Home-only equipment, stretches, pull-ups, chin-ups and dips are intentionally excluded.
const rawWorkoutGuideGymData = `
bench-press|Bench Press|Barbell|Chest|Triceps,Shoulders|weight_reps
incline-bench-press|Incline Bench Press|Barbell|Chest|Shoulders,Triceps|weight_reps
incline-dumbbell-press|Incline Dumbbell Press|Dumbbell|Chest|Shoulders,Triceps|weight_reps
dumbbell-bench-press|Dumbbell Bench Press|Dumbbell|Chest|Triceps,Shoulders|weight_reps
decline-bench-press|Decline Bench Press|Barbell|Chest|Triceps,Shoulders|weight_reps
machine-chest-press|Machine Chest Press|Machine|Chest|Triceps,Shoulders|weight_reps
pec-deck|Pec Deck|Machine|Chest|Shoulders|weight_reps
cable-fly|Cable Fly|Cable|Chest|Shoulders|weight_reps
overhead-press|Overhead Press|Barbell|Shoulders|Triceps|weight_reps
seated-dumbbell-press|Dumbbell Seated Shoulder Press|Dumbbell|Shoulders|Triceps|weight_reps
arnold-press|Arnold Press|Dumbbell|Shoulders|Triceps|weight_reps
lateral-raise|Lateral Raise|Dumbbell|Shoulders|Upper Back|weight_reps
cable-lateral-raise|Cable Lateral Raise|Cable|Shoulders|Upper Back|weight_reps
front-raise|Front Raise|Dumbbell|Shoulders|Chest|weight_reps
rear-delt-fly|Rear Delt Fly|Dumbbell|Rear Delts|Upper Back|weight_reps
reverse-pec-deck|Reverse Pec Deck|Machine|Rear Delts|Upper Back|weight_reps
face-pull|Face Pull|Cable|Upper Back|Rear Delts,Shoulders|weight_reps
upright-row|Upright Row|Barbell|Shoulders|Upper Back,Biceps|weight_reps
deadlift|Deadlift|Barbell|Posterior Chain|Back,Grip|weight_reps
romanian-deadlift|Romanian Deadlift|Barbell|Hamstrings|Glutes,Lower Back|weight_reps
barbell-row|Barbell Row|Barbell|Back|Biceps,Rear Delts|weight_reps
t-bar-row|T-Bar Row|Machine|Back|Biceps,Rear Delts|weight_reps
dumbbell-bent-over-row|Dumbbell Bent Over Row|Dumbbell|Back|Biceps,Rear Delts|weight_reps
one-arm-dumbbell-row|One-Arm Dumbbell Row|Dumbbell|Back|Biceps|weight_reps
chest-supported-row|Chest Supported Row|Machine|Back|Biceps,Rear Delts|weight_reps
seated-row|Seated Cable Row|Cable|Back|Biceps,Rear Delts|weight_reps
machine-row|Machine Row|Machine|Back|Biceps|weight_reps
lat-pulldown|Lat Pulldown|Cable|Lats|Biceps|weight_reps
close-grip-lat-pulldown|Close-Grip Lat Pulldown|Cable|Lats|Biceps|weight_reps
straight-arm-pulldown|Straight-Arm Pulldown|Cable|Lats|Core|weight_reps
shrug|Barbell Shrug|Barbell|Upper Back|Forearms|weight_reps
squat|Squat|Barbell|Quads|Glutes,Core|weight_reps
front-squat|Front Squat|Barbell|Quads|Core,Glutes|weight_reps
hack-squat|Hack Squat|Machine|Quads|Glutes|weight_reps
leg-press|Leg Press|Machine|Quads|Glutes,Hamstrings|weight_reps
bulgarian-split-squat|Bulgarian Split Squat|Dumbbell|Quads|Glutes,Core|weight_reps
walking-lunge|Walking Lunge|Dumbbell|Quads|Glutes,Hamstrings|weight_reps
step-up|Step-Up|Dumbbell|Quads|Glutes|weight_reps
leg-extension|Leg Extension|Machine|Quads||weight_reps
leg-curl|Leg Curl|Machine|Hamstrings|Calves|weight_reps
seated-leg-curl|Seated Leg Curl|Machine|Hamstrings|Calves|weight_reps
hip-thrust|Hip Thrust|Barbell|Glutes|Hamstrings|weight_reps
good-morning|Good Morning|Barbell|Hamstrings|Glutes,Lower Back|weight_reps
standing-calf-raise|Standing Calf Raise|Machine|Calves||weight_reps
seated-calf-raise|Seated Calf Raise|Machine|Calves||weight_reps
bicep-curl|Bicep Curl|Dumbbell|Biceps|Forearms|weight_reps
hammer-curl|Hammer Curl|Dumbbell|Biceps|Forearms|weight_reps
preacher-curl|Preacher Curl|Machine|Biceps|Forearms|weight_reps
cable-curl|Cable Curl|Cable|Biceps|Forearms|weight_reps
reverse-curl|Reverse Curl|Barbell|Forearms|Biceps|weight_reps
wrist-curl|Wrist Curl|Barbell|Forearms||weight_reps
tricep-pushdown|Tricep Pushdown|Cable|Triceps|Shoulders|weight_reps
overhead-tricep-extension|Overhead Tricep Extension|Cable|Triceps|Shoulders|weight_reps
skull-crusher|Skull Crusher|Barbell|Triceps|Shoulders|weight_reps
close-grip-bench-press|Close-Grip Bench Press|Barbell|Triceps|Chest,Shoulders|weight_reps
cable-crunch|Cable Crunch|Cable|Core||weight_reps
cycling|Cycling|Cardio|Legs|Cardio|distance_duration
rowing|Rowing|Cardio|Back|Legs,Cardio|distance_duration
stair-climber|Stair Climber|Cardio|Legs|Cardio|duration
dumbbell-fly|Dumbbell Fly|Dumbbell|Chest|Shoulders|weight_reps
incline-cable-fly|Incline Cable Fly|Cable|Chest|Shoulders|weight_reps
decline-dumbbell-press|Decline Dumbbell Press|Dumbbell|Chest|Triceps,Shoulders|weight_reps
smith-machine-bench-press|Smith Machine Bench Press|Machine|Chest|Triceps,Shoulders|weight_reps
landmine-press|Landmine Press|Barbell|Shoulders|Chest,Triceps|weight_reps
machine-shoulder-press|Machine Shoulder Press|Machine|Shoulders|Triceps|weight_reps
standing-dumbbell-press|Standing Dumbbell Press|Dumbbell|Shoulders|Triceps,Core|weight_reps
push-press|Push Press|Barbell|Shoulders|Triceps,Quads|weight_reps
machine-lateral-raise|Machine Lateral Raise|Machine|Shoulders|Upper Back|weight_reps
cable-front-raise|Cable Front Raise|Cable|Shoulders|Chest|weight_reps
plate-front-raise|Plate Front Raise|Plate|Shoulders|Chest|weight_reps
bent-over-rear-delt-raise|Bent-Over Rear Delt Raise|Dumbbell|Rear Delts|Upper Back|weight_reps
cable-rear-delt-fly|Cable Rear Delt Fly|Cable|Rear Delts|Upper Back|weight_reps
pendlay-row|Pendlay Row|Barbell|Back|Biceps,Rear Delts|weight_reps
meadows-row|Meadows Row|Barbell|Back|Biceps,Rear Delts|weight_reps
single-arm-cable-row|Single-Arm Cable Row|Cable|Back|Biceps,Rear Delts|weight_reps
wide-grip-lat-pulldown|Wide-Grip Lat Pulldown|Cable|Lats|Biceps|weight_reps
rack-pull|Rack Pull|Barbell|Back|Glutes,Hamstrings|weight_reps
dumbbell-shrug|Dumbbell Shrug|Dumbbell|Upper Back|Forearms|weight_reps
goblet-squat|Goblet Squat|Dumbbell|Quads|Glutes,Core|weight_reps
smith-machine-squat|Smith Machine Squat|Machine|Quads|Glutes,Core|weight_reps
belt-squat|Belt Squat|Machine|Quads|Glutes|weight_reps
sumo-deadlift|Sumo Deadlift|Barbell|Posterior Chain|Glutes,Quads|weight_reps
trap-bar-deadlift|Trap Bar Deadlift|Barbell|Posterior Chain|Quads,Grip|weight_reps
lying-leg-curl|Lying Leg Curl|Machine|Hamstrings|Calves|weight_reps
single-leg-romanian-deadlift|Single-Leg Romanian Deadlift|Dumbbell|Hamstrings|Glutes,Core|weight_reps
reverse-lunge|Reverse Lunge|Dumbbell|Quads|Glutes,Hamstrings|weight_reps
split-squat|Split Squat|Dumbbell|Quads|Glutes,Core|weight_reps
cable-kickback|Cable Kickback|Cable|Glutes|Hamstrings|weight_reps
hip-abduction-machine|Hip Abduction Machine|Machine|Glutes|Core|weight_reps
barbell-glute-bridge|Barbell Glute Bridge|Barbell|Glutes|Hamstrings,Core|weight_reps
dumbbell-glute-bridge|Dumbbell Glute Bridge|Dumbbell|Glutes|Hamstrings,Core|weight_reps
dumbbell-hip-thrust|Dumbbell Hip Thrust|Dumbbell|Glutes|Hamstrings|weight_reps
smith-machine-hip-thrust|Smith Machine Hip Thrust|Machine|Glutes|Hamstrings,Core|weight_reps
smith-machine-romanian-deadlift|Smith Machine Romanian Deadlift|Machine|Hamstrings|Glutes,Lower Back|weight_reps
dumbbell-romanian-deadlift|Dumbbell Romanian Deadlift|Dumbbell|Hamstrings|Glutes,Lower Back|weight_reps
kettlebell-romanian-deadlift|Kettlebell Romanian Deadlift|Kettlebell|Hamstrings|Glutes,Lower Back|weight_reps
cable-pull-through|Cable Pull-Through|Cable|Glutes|Hamstrings,Lower Back|weight_reps
machine-glute-kickback|Machine Glute Kickback|Machine|Glutes|Hamstrings|weight_reps
cable-standing-hip-abduction|Cable Standing Hip Abduction|Cable|Glutes|Core|weight_reps
cable-standing-hip-adduction|Cable Standing Hip Adduction|Cable|Adductors|Core,Glutes|weight_reps
hip-adduction-machine|Hip Adduction Machine|Machine|Adductors|Core|weight_reps
smith-machine-bulgarian-split-squat|Smith Machine Bulgarian Split Squat|Machine|Quads|Glutes,Core|weight_reps
smith-machine-reverse-lunge|Smith Machine Reverse Lunge|Machine|Quads|Glutes,Hamstrings,Core|weight_reps
smith-machine-split-squat|Smith Machine Split Squat|Machine|Quads|Glutes,Core|weight_reps
heel-elevated-goblet-squat|Heel-Elevated Goblet Squat|Dumbbell|Quads|Glutes,Core|weight_reps
dumbbell-sumo-squat|Dumbbell Sumo Squat|Dumbbell|Glutes|Quads,Adductors,Hamstrings|weight_reps
dumbbell-sumo-deadlift|Dumbbell Sumo Deadlift|Dumbbell|Posterior Chain|Glutes,Quads,Adductors|weight_reps
front-foot-elevated-split-squat|Front-Foot Elevated Split Squat|Dumbbell|Quads|Glutes,Core|weight_reps
deficit-reverse-lunge|Deficit Reverse Lunge|Dumbbell|Glutes|Quads,Hamstrings,Core|weight_reps
dumbbell-lateral-lunge|Dumbbell Lateral Lunge|Dumbbell|Quads|Glutes,Adductors,Hamstrings|weight_reps
dumbbell-curtsy-lunge|Dumbbell Curtsy Lunge|Dumbbell|Glutes|Quads,Hamstrings,Core|weight_reps
landmine-squat|Landmine Squat|Barbell|Quads|Glutes,Core|weight_reps
landmine-romanian-deadlift|Landmine Romanian Deadlift|Barbell|Hamstrings|Glutes,Lower Back|weight_reps
kettlebell-swing|Kettlebell Swing|Kettlebell|Glutes|Hamstrings,Core,Cardio|weight_reps
reverse-hyperextension|Reverse Hyperextension|Machine|Glutes|Hamstrings,Lower Back|bodyweight_reps
donkey-calf-raise|Donkey Calf Raise|Machine|Calves||weight_reps
leg-press-calf-raise|Leg Press Calf Raise|Machine|Calves||weight_reps
incline-dumbbell-curl|Incline Dumbbell Curl|Dumbbell|Biceps|Forearms|weight_reps
concentration-curl|Concentration Curl|Dumbbell|Biceps|Forearms|weight_reps
ez-bar-curl|EZ-Bar Curl|Barbell|Biceps|Forearms|weight_reps
spider-curl|Spider Curl|Dumbbell|Biceps|Forearms|weight_reps
rope-hammer-curl|Rope Hammer Curl|Cable|Biceps|Forearms|weight_reps
drag-curl|Drag Curl|Barbell|Biceps|Forearms|weight_reps
rope-tricep-pushdown|Rope Tricep Pushdown|Cable|Triceps|Shoulders|weight_reps
dumbbell-skull-crusher|Two Dumbbell Skullcrusher|Dumbbell|Triceps|Shoulders|weight_reps
single-dumbbell-skullcrusher|Single Dumbbell Skullcrusher|Dumbbell|Triceps|Shoulders|weight_reps
dumbbell-overhead-tricep-extension|Dumbbell Overhead Tricep Extension|Dumbbell|Triceps|Shoulders|weight_reps
single-arm-dumbbell-tricep-extension|Single Arm Dumbbell Tricep Extension|Dumbbell|Triceps|Shoulders|weight_reps
tricep-kickback|Tricep Kickback|Dumbbell|Triceps|Shoulders|weight_reps
wrist-extension|Wrist Extension|Dumbbell|Forearms||weight_reps
farmer-carry|Farmer Carry|Dumbbell|Forearms|Upper Back,Core|distance_duration
pallof-press|Pallof Press|Cable|Core|Shoulders|weight_reps
cable-woodchop|Cable Woodchop|Cable|Core|Shoulders|weight_reps
half-kneeling-pallof-press|Half-Kneeling Pallof Press|Cable|Core|Glutes,Shoulders|weight_reps
cable-pallof-hold|Cable Pallof Hold|Cable|Core|Glutes,Shoulders|duration
captains-chair-knee-raise|Captain's Chair Knee Raise|Machine|Core|Shoulders|bodyweight_reps
decline-sit-up|Decline Sit-Up|Bench|Core|Quads|bodyweight_reps
weighted-crunch|Weighted Crunch|Plate|Core||weight_reps
weighted-russian-twist|Weighted Russian Twist|Dumbbell|Core|Shoulders|weight_reps
dumbbell-side-bend|Dumbbell Side Bend|Dumbbell|Core|Grip|weight_reps
elliptical|Elliptical|Cardio|Legs|Cardio|duration
assault-bike|Assault Bike|Cardio|Legs|Cardio,Shoulders|distance_duration
skierg|SkiErg|Cardio|Back|Triceps,Core,Cardio|distance_duration
treadmill-incline-walk|Treadmill Incline Walk|Cardio|Legs|Glutes,Cardio|distance_duration
battle-ropes|Battle Ropes|Cardio|Shoulders|Core,Cardio|duration
single-leg-box-squat|Single-Leg Box Squat|Box|Quads|Glutes,Hamstrings,Core|bodyweight_reps
step-down|Step-Down|Box|Quads|Glutes,Hamstrings,Calves|bodyweight_reps
stability-ball-hamstring-curl|Stability Ball Hamstring Curl|Stability Ball|Hamstrings|Glutes,Core|bodyweight_reps
`;

export const workoutGuideGymRecords: WorkoutGuideGymRecord[] = rawWorkoutGuideGymData
  .trim()
  .split("\n")
  .map((line) => {
    const [slug, name, equipment, primaryMuscle, secondaryRaw, exerciseType] = line.split("|");
    return {
      slug,
      name,
      equipment,
      primaryMuscle,
      secondaryMuscles: secondaryRaw ? secondaryRaw.split(",") : [],
      exerciseType,
    };
  });

