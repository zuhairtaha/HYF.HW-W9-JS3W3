/**
 * create and return array: [1,2,3...n]
 * @param {number} n
 * @returns {Array}
 */
function createNumbersArray(n) {
    const numbers = [];
    for (let i = 1; i <= n; i++) {
        numbers.push(i);
    }
    return numbers;
}

// --------------------------
const numbers1To1000 = createNumbersArray(1000);
const dividers = createNumbersArray(30);

// --------------------------
/**
 * divisible factory (closure)
 * @param {number} divider
 * @returns {function}
 */
function divisibleFactory(divider) {
    return numbersArray => numbersArray.filter(number => number % divider === 0);
}

// --------------------------
let dividersNumbers = [3, 10, 21]
    .map(divisibleFactory)
    .map(divisibilityChecker => divisibilityChecker(numbers1To1000));
dividersNumbers.forEach(divider => {
    console.log(`${divider.length} numbers divisible by ${divider[0]}:\n ${divider.join(',')}\n`);
});
// --------------------------
// Number of items which are divisible by 1 to 30:
const result = dividers
    .map(divisibleFactory)
    .map(divisibilityChecker => divisibilityChecker(numbers1To1000).length)
;

console.log(`Number of items which are divisible by 1 to 30:\n ${result.join(',')}`);