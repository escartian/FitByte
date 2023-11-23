export const Muscle = {
    abdominals : "abdominals",
    hamstrings : "hamstrings",
    calves : "calves",
    shoulders : "shoulders",
    adductors : "adductors",
    glutes : "glutes",
    quadriceps : "quadriceps",
    biceps : "biceps",
    forearms : "forearms",
    abductors : "abductors",
    triceps : "triceps",
    chest : "chest",
    lower_back : "lower back",
    traps : "traps",
    middle_back : "middle back",
    lats : "lats",
    neck : "neck",
  };
  
  export const Force ={
    pull : "pull",
    push : "push",
    static : "static",
  };
  
  export const Level ={
    beginner : "beginner",
    intermediate : "intermediate",
    expert : "expert",
  };
  
  export const Mechanic ={
    compound : "compound",
    isolation : "isolation",
  };
  
  export const Equipment ={
    body : "body only",
    machine : "machine",
    kettlebells : "kettlebells",
    dumbbell : "dumbbell",
    cable : "cable",
    barbell : "barbell",
    bands : "bands",
    medicine_ball : "medicine ball",
    exercise_ball : "exercise ball",
    e_z_curl_bar : "e-z curl bar",
    foam_roll : "foam roll",
  };
  
  export const Category ={
    strength : "strength",
    stretching : "stretching",
    plyometrics : "plyometrics",
    strongman : "strongman",
    powerlifting : "powerlifting",
    cardio : "cardio",
    olympic_weightlifting : "olympic weightlifting",
    crossfit : "crossfit",
    weighted_bodyweight : "weighted bodyweight",
    assisted_bodyweight : "assisted bodyweight",
  };

export const WeightModifier ={
  positive : "positive",
  negative : "negative",
};

export const WeightUnit ={
  kg : "kg",
  lbs : "lbs",
};

export const DistanceUnit= {
  km : "km",
  miles : "miles",
};

export const Fields ={
  reps : "reps",
  time : "time",
  distance : "distance",
  weight : "weight",
};

/**
 * @typedef {Object} Measure
 * @property {Fields[]} requiredFields
 * @property {Fields[]} [optionalFields]
 * @property {WeightModifier} [weightModifier]
 * @property {WeightUnit} [weightUnit]
 * @property {DistanceUnit} [distanceUnit]
 */

  /**
 * @typedef {Object} Exercise
 * @property {string} name
 * @property {string[]} [aliases]
 * @property {Muscle[]} primaryMuscles
 * @property {Muscle[]} secondaryMuscles
 * @property {Force} [force]
 * @property {Level} level
 * @property {Mechanic} [mechanic]
 * @property {Equipment} [equipment]
 * @property {Category} category
 * @property {string[]} instructions
 * @property {string} [description]
 * @property {string[]} [tips]
 */

