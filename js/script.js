// js/script.js

// Функція перемішування масиву (Фішера–Єйтса)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Ініціалізація
let words = shuffleArray([...WORDS_A1]);
let currentWordIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let wordVisible = false; // спочатку слово приховане

// DOM елементи
const wordElement = document.getElementById("word");
const optionsElement = document.getElementById("options");
const scoreElement = document.getElementById("score");
const resultElement = document.getElementById("result");
const restartButton = document.getElementById("restart");
const showWordCheckbox = document.getElementById("showWordCheckbox");
const listenButton = document.getElementById("listenButton");
const autoSpeakCheckbox = document.getElementById("autoSpeakCheckbox"); // нова галочка

// Функція озвучення
function speakWord(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

// Показуємо слово та варіанти відповідей
function showWord() {
  if (currentWordIndex >= words.length) {
    endGame();
    return;
  }

  const currentWord = words[currentWordIndex];

  // Відображення слова залежно від галочки
  wordElement.textContent = wordVisible ? currentWord.en : "*******";

  // Автоматична озвучка нового слова (якщо увімкнено галочку)
  if (autoSpeakCheckbox.checked) {
    speakWord(currentWord.en);
  }

  // Створюємо 3 неправильних варіанти + правильний
  let options = [currentWord.uk];
  let usedIndexes = new Set([currentWordIndex]);
  while (options.length < 4) {
    const idx = Math.floor(Math.random() * words.length);
    if (!usedIndexes.has(idx)) {
      options.push(words[idx].uk);
      usedIndexes.add(idx);
    }
  }

  options = shuffleArray(options);

  // Відображення кнопок з варіантами
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
  } else {
    button.classList.add("wrong");
    wrongAnswers++;
    // Показати правильний варіант
    optionButtons.forEach(btn => {
      if (btn.textContent === correct) btn.classList.add("correct");
    });
  }

  scoreElement.textContent = `Правильних: ${correctAnswers} | Неправильних: ${wrongAnswers}`;

  currentWordIndex++;
  setTimeout(showWord, 1000);
}

// Кінець гри
function endGame() {
  wordElement.textContent = "Гру завершено!";
  optionsElement.innerHTML = "";
  resultElement.textContent = `Ваш результат: ${correctAnswers} правильних, ${wrongAnswers} неправильних.`;
}

// Галочка "Показати слово" керує тільки видимістю тексту
showWordCheckbox.addEventListener("change", () => {
  wordVisible = showWordCheckbox.checked;
  const currentWord = words[currentWordIndex];
  if (currentWord) {
    wordElement.textContent = wordVisible ? currentWord.en : "*******";
  }
});

// Кнопка "Слухати" завжди озвучує слово
listenButton.addEventListener("click", () => {
  const currentWord = words[currentWordIndex];
  if (currentWord) speakWord(currentWord.en);
});

// Кнопка "Грати знову"
restartButton.addEventListener("click", () => {
  currentWordIndex = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  scoreElement.textContent = "";
  resultElement.textContent = "";
  words = shuffleArray([...WORDS_A1]);
  wordVisible = showWordCheckbox.checked;
  showWord();
});

// Старт гри
showWord();
