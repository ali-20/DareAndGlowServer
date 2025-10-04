export const rollDice = (sides = 6) => {
const value = Math.floor(Math.random() * sides) + 1;
return { value, sides, timestamp: Date.now() };
};