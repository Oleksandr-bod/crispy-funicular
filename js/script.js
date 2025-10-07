// Функція перемішування масиву (Фішера–Єйтса)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Ініціалізація
let allWords = shuffleArray([...WORDS_A1]);
let currentSet = [];
let currentSetSize = 10;
let currentWordIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let wordVisible = false;
let roundCorrect = 0;
let roundWrong = 0;

// DOM елементи
const wordElement = document.getElementById("word");
const optionsElement = document.getElementById("options");
const scoreElement = document.getElementById("score");
const resultElement = document.getElementById("result");
const restartButton = document.getElementById("restart");
const showWordCheckbox = document.getElementById("showWordCheckbox");
const listenButton = document.getElementById("listenButton");
const autoSpeakCheckbox = document.getElementById("autoSpeakCheckbox");

// Озвучення
function speakWord(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

// Почати новий раунд
function startRound() {
  currentSet = allWords.slice(0, currentSetSize);
  currentSet = shuffleArray(currentSet);
  currentWordIndex = 0;
  roundCorrect = 0;
  roundWrong = 0;
  showWord();
}

// Показати слово
function showWord() {
  if (currentWordIndex >= currentSet.length) {
    endRound();
    return;
  }

  const currentWord = currentSet[currentWordIndex];
  wordElement.textContent = wordVisible ? currentWord.en : "*******";

  if (autoSpeakCheckbox.checked) {
    speakWord(currentWord.en);
  }

  // Варіанти
  let options = [currentWord.uk];
  let usedIndexes = new Set([allWords.indexOf(currentWord)]);
  while (options.length < 4) {
    const idx = Math.floor(Math.random() * allWords.length);
    if (!usedIndexes.has(idx)) {
      options.push(allWords[idx].uk);
      usedIndexes.add(idx);
    }
  }

  options = shuffleArray(options);

  // Відображення варіантів
  optionsElement.innerHTML = "";
  options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.addEventListener("click", () => checkAnswer(option, currentWord.uk, button));
    optionsElement.appendChild(button);
  });
}

// Перевірка відповіді
function checkAnswer(selected, correct, button) {
  const optionButtons = document.querySelectorAll(".option-btn");

  if (selected === correct) {
    button.classList.add("correct");
    correctAnswers++;
    roundCorrect++;
  } else {
    button.classList.add("wrong");
    wrongAnswers++;
    roundWrong++;
    optionButtons.forEach(btn => {
      if (btn.textContent === correct) btn.classList.add("correct");
    });
  }

  scoreElement.textContent = `Правильних: ${correctAnswers} | Неправильних: ${wrongAnswers}`;
  currentWordIndex++;
  setTimeout(showWord, 1000);
}

// Кінець раунду
function endRound() {
  if (roundWrong === 0) {
    currentSetSize++; // якщо всі правильні → додаємо 1 слово
    resultElement.textContent = `✅ Усі правильні! Додаємо +1 слово (${currentSetSize})`;
  } else {
    resultElement.textContent = `🔁 Є помилки (${roundWrong}). Повторюємо ті ж ${currentSetSize} слів.`;
  }

  setTimeout(startRound, 2000);
}

// Кінець гри (якщо закінчили всі слова)
function endGame() {
  wordElement.textContent = "Гру завершено!";
  optionsElement.innerHTML = "";
  resultElement.textContent = `Ваш результат: ${correctAnswers} правильних, ${wrongAnswers} неправильних.`;
}

// Галочка “Показати слово”
showWordCheckbox.addEventListener("change", () => {
  wordVisible = showWordCheckbox.checked;
  const currentWord = currentSet[currentWordIndex];
  if (currentWord) {
    wordElement.textContent = wordVisible ? currentWord.en : "*******";
  }
});

// Кнопка “Слухати”
listenButton.addEventListener("click", () => {
  const currentWord = currentSet[currentWordIndex];
  if (currentWord) speakWord(currentWord.en);
});

// Кнопка “Грати знову”
restartButton.addEventListener("click", () => {
  allWords = shuffleArray([...WORDS_A1]);
  currentSetSize = 10;
  correctAnswers = 0;
  wrongAnswers = 0;
  resultElement.textContent = "";
  scoreElement.textContent = "";
  startRound();
});

// Старт
startRound();
