// Global variables
const newGameMenuItem = document.querySelector("button[id=new-menu-item]");
// const stopGameMenuItem = document.querySelector("button[id=end-menu-item]");
const configMenuItem = document.querySelector("button[id=config-menu-item]");
const aboutMenuItem = document.querySelector("button[id=about-menu-item]");

const modeDiv = document.getElementById("score-mode")
const triesDiv = document.getElementById("score-tries");
const streakDiv = document.getElementById("score-streak");

const difficultySelect = document.getElementById("select-difficulty");
const languageSelect = document.getElementById("select-language");
const confirmConfigButton = document.getElementById("confirm-config-button");
const cancelConfigButton = document.getElementById("cancel-config-button");

// const configDialog = document.getElementById("config-dialog");

// Recursive permutation operation
const permutator = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }
    permute(inputArr)
    return result;
}

// ASCII codes: 65 => 'A', 90 => 'Z'
const letters = [...Array(90 - 65 + 1).keys()].map(el => String.fromCharCode(65 + el));
let strings = {};
let wordsData = {
    'portuguese': null,
    'english': null
};
let words = [
    "escolas", "periodo", "teclado", "hesites", "curioso", "marmita", "frenesi", "sentido", "zabumba", 
    "corisco", "acabado", "caixote"
].map((el) => el.toUpperCase());

const letterKeys = letters.map(el => document.getElementById(`tk${el}`));
const messageElement = document.getElementById("message-bar");
messageElement.textContent = "Press 'New' to play";
let messageStatus = "primary";
messageElement.classList.add(`alert-${messageStatus}`);
// const reinitElement = document.getElementById("reinit");
//const languageSelect = document.getElementById("mySelect");
const displayDiv = document.getElementById("letter-grid");
const frameState = {
    frame: null,
    solutionIndex: 0,
    horizontal: true
};

const wordLength = 7;
let guessedLetters = [...Array(wordLength).keys()].map(el => "");

const indexesPermutations = permutator([...Array(wordLength).keys()]);
const indexesFramePermutations = choosePermutations(wordLength);

// Set frame elements
const frame = [];
for (let i = 0; i < wordLength; i++) {
    frame[i] = [];
    for (let j = 0; j < wordLength; j++) {
        frame[i][j] = document.getElementById(`display${i}${j}`);
    }
}

// Score variables
let numOfWrongGuesses = 0, numOfCorrectGuesses = 0;
let mode = "easy";
let language = "portuguese";
let numOfTries = 0;
let winStreak = 0;
// Selected word
let selectedWord = null;
// Game initiated flag
let gameStarted = false;

// For menu items
newGameMenuItem.addEventListener(
    "click",
    function () {
        if (!gameStarted) {
            gameStarted = true;
            this.textContent = strings[language]["stop-game"];
            restartGame();
        } else {
            gameStarted = false;
            this.textContent = strings[language]["new-game"];
            endGame();
            // Status bar
            messageElement.textContent = strings[language]["initial"];
        }
    }
);
// stopGameMenuItem.addEventListener("click", () => endGame());

// For settings selections
confirmConfigButton.addEventListener(
    "click",
    function () {
        mode = difficultySelect.value;
        language = languageSelect.value;
        updateMode();
        updateWords();
        updateStrings();
    }
);

// Helper functions
// Clear guessed letters
function clearGuessedLetters() {
    guessedLetters = [...Array(7).keys()].map(el => "");
}

// Clear display
function clearDisplay() {
    frameState.frame = null;
    frameState.solutionIndex = 0;
    frameState.horizontal = true;
    updateDisplayElements();
}

// Enable / disable keys
function enableKey(key) {
    key.disabled = false;   
    key.style.background = "#b84b02";
}

function disableKey(key) {
    key.disabled = true;
    key.style.background = "grey";
}

function enableSettings() {
    configMenuItem.disabled = false;
}

function disableSettings() {
    configMenuItem.disabled = true;
}

function enableAllKeys() {
    letterKeys.forEach((key) => enableKey(key));
}

function disableAllKeys() {
    letterKeys.forEach((key) => disableKey(key));
}

function enableAnimation() {
    frame.forEach((row) => row.forEach((el) => el.classList.add("letter-animated")));
}

function disableAnimation() {
    frame.forEach((row) => row.forEach((el) => el.classList.remove("letter-animated")));
}

// Update score
function resetTries() {
    if (mode === "easy") {
        numOfTries = 20;
    } else {
        numOfTries = 10;
    }
    updateTries();
}

function resetStreak() {
    winStreak = 0;
    updateStreak();
}

function updateMode() {
    modeDiv.textContent = strings[language]["config-diff"][mode];
    for (const localMode of ["score-mode-disabled", "score-mode-easy", "score-mode-hard"]) {
        modeDiv.classList.remove(localMode);
    }
    // modeDiv.classList.remove("score-mode-disabled");
    modeDiv.classList.add(`score-mode-${mode}`);
}

function updateWords() {
    words = wordsData[language].map((el) => el.toUpperCase());
}

function updateStrings() {
    // Menu
    newGameMenuItem.textContent = strings[language]["new-game"];
    configMenuItem.textContent = strings[language]["settings"];
    // Score
    document.getElementById("score-tries-label").textContent = `${strings[language]["score-tries"]}:`;
    document.getElementById("score-streak-label").textContent = `${strings[language]["score-streak"]}:`;
    // Status bar
    messageElement.textContent = strings[language]["initial"];
    // Settings
    document.getElementById("settings-title").textContent = strings[language]["settings"];
    document.getElementById("settings-diff-label").textContent = `${strings[language]["config-diff-label"]}:`;
    document.getElementById("settings-diff-easy").textContent = strings[language]["config-diff"]["easy"];
    document.getElementById("settings-diff-hard").textContent = strings[language]["config-diff"]["hard"];
    document.getElementById("settings-lang-label").textContent = `${strings[language]["config-lang-label"]}:`;
    document.getElementById("settings-lang-portuguese").textContent = strings[language]["config-lang"]["portuguese"];
    document.getElementById("settings-lang-english").textContent = strings[language]["config-lang"]["english"];
    confirmConfigButton.textContent = strings[language]["confirm-settings"];
    cancelConfigButton.textContent = strings[language]["cancel-settings"];
    // About
    document.getElementById("about-created-by").textContent = strings[language]["about"];
    document.getElementById("about-btn-close").textContent = strings[language]["about-close"];
}

function updateTries() {
    triesDiv.textContent = `${numOfTries}`;
}

function updateStreak() {
    streakDiv.textContent = `${winStreak}`;
}

// Restart game
function restartGame() {
    // Reset counts
    numOfWrongGuesses = 0;
    numOfCorrectGuesses = 0;

    // Disable keys
    disableAllKeys();

    // Reinitialize guesses
    clearGuessedLetters();

    // Restart display
    clearDisplay();

    // Enable animation
    enableAnimation();

    // Display messages
    messageElement.classList.remove(`alert-${messageStatus}`);
    messageStatus = "primary";
    messageElement.classList.add(`alert-${messageStatus}`);

    // Update mode
    updateMode();

    // Reset score
    resetTries();

    // Start game
    startGame();
}

// Choose randomly n items from elements
function choose(elements, n) {
    if (n === 1) {
        return elements[Math.floor(Math.random() * elements.length)];
    }

    const chosen = [];
    let index, removedItem;
    const m = Math.min(n, elements.length);
    for (let i = 0; i < m; i++) {
        index = Math.floor(Math.random() * elements.length);
        removedItem = elements.splice(index, 1);
        chosen[i] = removedItem[0];
    }
    return chosen;
}

// Sample new word from the dictionary
function selectWord() {
    return choose(words, 1)
}

// Choose valid permutations, in the context of generating the frames
function choosePermutations(n) {
    let localIndexPermutations = indexesPermutations.slice(1);
    const chosenPermutations = [indexesPermutations[0]];
    for (let i = 1; i < n; i++) {
        const validIndices = [];
        let j, p, isValid, chosenPermutation;
        for (j = 0; j < localIndexPermutations.length; j++) {
            p = localIndexPermutations[j];
            isValid = true;
            for (chosenPermutation of chosenPermutations) {
                for (let k = 0; k < chosenPermutation.length; k++) {
                    if (chosenPermutation[k] === p[k]) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) {
                    break;
                }
            }
            if (isValid) {
                validIndices.push(j);
            }
        }
        const indexOfIndex = choose([...Array(validIndices.length).keys()], 1);
        const index = validIndices.splice(indexOfIndex, 1)[0];
        chosenPermutation = localIndexPermutations[index];
        // Add chosen permutation to the global list
        chosenPermutations.push(chosenPermutation);
        // Remove invalid permutations
        const validIndexPermutations = [];
        for (j = 0; j < localIndexPermutations.length; j++) {
            if (validIndices.includes(j)) {
                validIndexPermutations.push(localIndexPermutations[j]);
            }
        }
        localIndexPermutations = validIndexPermutations;
    }
    return chosenPermutations;
}

// Transpose frame
function tranposeFrame(inputFrame) {
    const outputFrame = [];
    for (let i = 0; i < inputFrame.length; i++) {
        const column = [];
        for (let j = 0; j < inputFrame[i].length; j++) {
            column.push(inputFrame[i][j]);					
        }
        outputFrame.push(column);
    }
    return outputFrame;
}

// Auxiliary functions
// Generate frame rows (without any transformation)
function generateRows(letterArray) {
    const rows = [];
    // const chosenPermutations = choosePermutations(letterArray.length);
    const chosenPermutations = indexesFramePermutations;
    for (const chosenPermutation of chosenPermutations) {
        // Add letters corresponding to permutation
        rows.push(chosenPermutation.map((el) => letterArray[el]));
    }
    return rows;
}

// Generate local frame
function generateLocalFrame() {
    let letterArray = guessedLetters.slice(0);
    const localFrame = [];
    // If no guessed letter exists, return empty frame
    if (letterArray.reduce((el, val) => el + val) === '') {
        for (let i = 0; i < letterArray.length; i++) {
            localFrame.push(letterArray);
        }
        return localFrame;
    }
    // Reverse?
    if (Math.random() < 0.5) {
        letterArray = letterArray.reverse(); 
    }
    // Generate rows
    const rows = generateRows(letterArray);
    // Scramble rows into frame
    const indices = choose([...Array(rows.length).keys()], rows.length);
    for (const i of indices) {
        localFrame.push(rows[i]);
    }
    // Save frame state
    frameState.frame = localFrame;
    frameState.solutionIndex = indices.indexOf(0); 
    frameState.horizontal = (Math.random() < 0.5);
}

// Update display
function updateDisplay(highlightWin = false) { // se clicar dentro do tempo, essa função é ativada.
    generateLocalFrame();
    updateDisplayElements(highlightWin);
}

// Update display elements
function updateDisplayElements(highlightWin = false) {
    for (let i = 0; i < frame.length; i++) {
        for (let j = 0; j < frame[i].length; j++) {
            const indices = frameState.horizontal? [i, j] : [j, i];
            const solutionIndex = frameState.horizontal? indices[0] : indices[1];
            frame[indices[0]][indices[1]].textContent = (frameState.frame === null)? "" : frameState.frame[i][j];
            if (highlightWin && solutionIndex === frameState.solutionIndex) {
                frame[indices[0]][indices[1]].style.backgroundColor = "lightgreen";
            } else {
                frame[indices[0]][indices[1]].removeAttribute("style");
            }
        }
    }
}

// Functions to control the game flow
// Start game
function startGame() {
    // Select word
    selectedWord = selectWord();
    // Enable keyboard
    enableAllKeys();
    // Disable settings
    disableSettings();
    messageElement.textContent = strings[language]["choose"];
}

// Update game status
function updateGameStatus(e) { //event listener, combinado com o this do input. aqui será um while
    let inputKey = e.value;
    console.log(inputKey);
                    
    // Choose letter
    let message, isWin = false;
    let response = confirm(`${strings[language]["confirm-input"]} '${inputKey}'?`);
    if (response === true) {
        disableKey(letterKeys[letters.indexOf(inputKey)]);
    } else {
        inputKey = null;
        message = strings[language]["choose-next"];
        messageElement.textContent = message;
        return	
    }

    // Update scores and display
    if (!selectedWord.includes(inputKey)) {
        numOfWrongGuesses++;
        numOfTries--;
        updateTries();
        console.log("Erros: " + numOfWrongGuesses);
            if (numOfTries > 0) {
                message = `${strings[language]["failure"]} '${inputKey}'. ${strings[language]["choose-next"]}.`;
                messageElement.textContent = message;
                messageElement.classList.remove(`alert-${messageStatus}`);
                messageStatus = "danger";
                messageElement.classList.add(`alert-${messageStatus}`);
            } else {
                message = strings[language]["loss"];
                messageElement.textContent = message;
                messageElement.classList.remove(`alert-${messageStatus}`);
                messageStatus = "danger";
                messageElement.classList.add(`alert-${messageStatus}`);
                resetStreak();
                endGame();
            }
    } else {
        numOfCorrectGuesses++;
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === inputKey) {
                guessedLetters[i] = inputKey;
            }
        }
        if (guessedLetters.reduce((el, acc) => el + acc) != selectedWord) {
            message = `${strings[language]["success"]} '${inputKey}'. ${strings[language]["choose-next"]}.`;
            messageElement.textContent = message;
        } else {
            message = `${strings[language]["win"]} '${selectedWord}'.`;
            messageElement.textContent = message;
            isWin = true;
        }
        messageElement.classList.remove(`alert-${messageStatus}`);
        messageStatus = "success";
        messageElement.classList.add(`alert-${messageStatus}`);
    }

    console.log ("Acertos: " + numOfCorrectGuesses);
    console.log ("Erros: " + numOfWrongGuesses);

    updateDisplay(highlightWin = isWin);
    if (isWin) {
        winStreak++;
        updateStreak();
        endGame();
    }
}

// End game
function endGame() {
    numOfCorrectGuesses = 0;
    numOfWrongGuesses = 0;
    numOfTries = 0;
    updateTries();
    selectedWord = null;
    clearGuessedLetters();
    // document.getElementById("stop").disabled = true; 
    disableAllKeys();
    // Disable animation
    disableAnimation();
    // Enable settings
    enableSettings();
}

$(document).ready(
    function () {
        $.getJSON(
            "./assets/dict-portuguese.json",
            function(json) { wordsData.portuguese = json; }
        );
        $.getJSON(
            "./assets/dict-english.json",
            function(json) { wordsData.english = json; }
        );
        $.getJSON(
            "./assets/strings.json",
            function(json) { strings = json; }
        );
        // Show config dialog at the start
        $("#config-dialog").modal('show');
    }
);

