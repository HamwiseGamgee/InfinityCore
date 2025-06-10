export class BattleRoll{

}

/*
  Returns the number of successes in a d6 challenge die roll
*/
export function getSuccessesFromBattleRoll(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die <= 2) {
      return 1
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}

/*
  Returns the number of effects in a  d6 challenge die roll
*/
export function getEffectsFromBattleRoll(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die >= 6) {
      return 1;
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}
