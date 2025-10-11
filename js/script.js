// Функція перемішування масиву (Фішера–Єйтса)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Ініціалізація змінних
let allWords = shuffleArray([...WORDS_A1]);
let currentSet = [];
let currentSetSize = 10;
let currentWordIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let wordVisible = true; // ✅ спочатку показуємо слово
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

// ✅ Збереження прогресу
function saveProgress() {
  const progress = {
    allWords,
    currentSet,
    currentSetSize,
    currentWordIndex,
    correctAnswers,
    wrongAnswers,
    roundCorrect,
    roundWrong,
    wordVisible
  };
  localStorage.setItem("gameProgress", JSON.stringify(progress));
}

// ✅ Завантаження прогресу
function loadProgress() {
  const saved = localStorage.getItem("gameProgress");
  if (saved) {
    const progress = JSON.parse(saved);
    allWords = progress.allWords;
    currentSet = progress.currentSet;
    currentSetSize = progress.currentSetSize;
    currentWordIndex = progress.currentWordIndex;
    correctAnswers = progress.correctAnswers;
    wrongAnswers = progress.wrongAnswers;
    roundCorrect = progress.roundCorrect;
    roundWrong = progress.roundWrong;
    wordVisible = progress.wordVisible;

    scoreElement.textContent = `Правильних: ${correctAnswers} | Неправильних: ${wrongAnswers}`;
    showWordCheckbox.checked = wordVisible;

    showWord();
    return true;
  }
  return false;
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

  saveProgress(); // ✅ зберігаємо після показу слова
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

  saveProgress(); // ✅ зберігаємо після відповіді

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

  saveProgress(); // ✅ зберігаємо після раунду

  setTimeout(startRound, 2000);
}

// Кінець гри (якщо закінчили всі слова)
function endGame() {
  wordElement.textContent = "Гру завершено!";
  optionsElement.innerHTML = "";
  resultElement.textContent = `Ваш результат: ${correctAnswers} правильних, ${wrongAnswers} неправильних.`;
  localStorage.removeItem("gameProgress"); // очищаємо прогрес
}

// Галочка “Показати слово”
showWordCheckbox.addEventListener("change", () => {
  wordVisible = showWordCheckbox.checked;
  const currentWord = currentSet[currentWordIndex];
  if (currentWord) {
    wordElement.textContent = wordVisible ? currentWord.en : "*******";
  }
  saveProgress();
});

// Кнопка “Слухати”
listenButton.addEventListener("click", () => {
  const currentWord = currentSet[currentWordIndex];
  if (currentWord) speakWord(currentWord.en);
});

// Кнопка “Грати знову”
restartButton.addEventListener("click", () => {
  localStorage.removeItem("gameProgress"); // очищаємо прогрес
  allWords = shuffleArray([...WORDS_A1]);
  currentSetSize = 10;
  correctAnswers = 0;
  wrongAnswers = 0;
  resultElement.textContent = "";
  scoreElement.textContent = "";
  startRound();
});

// ✅ При завантаженні галочка вже стоїть
showWordCheckbox.checked = true;
wordVisible = true;

// Старт гри або завантаження прогресу
if (!loadProgress()) {
  startRound();
}
