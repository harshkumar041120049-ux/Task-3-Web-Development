
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherMessage = document.getElementById("weatherMessage");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const condition = document.getElementById("condition");

// Convert weather codes into readable conditions.
function getWeatherInfo(code) {
    if (code === 0) return { text: "Clear sky", icon: "☀️" };
    if ([1, 2].includes(code)) return { text: "Partly cloudy", icon: "🌤️" };
    if (code === 3) return { text: "Overcast", icon: "☁️" };
    if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️" };
    if ([51, 53, 55, 56, 57].includes(code)) {
        return { text: "Drizzle", icon: "🌦️" };
    }
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { text: "Rainy", icon: "🌧️" };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { text: "Snowy", icon: "❄️" };
    }
    if ([95, 96, 99].includes(code)) {
        return { text: "Thunderstorm", icon: "⛈️" };
    }

    return { text: "Unknown", icon: "🌍" };
}

// Fetch weather data for the entered city.
weatherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        weatherMessage.textContent = "Please enter a city name.";
        return;
    }

    weatherMessage.textContent = "Fetching weather data...";
    weatherForm.querySelector("button").disabled = true;

    try {
        // Step 1: Find the city's latitude and longitude.
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling and try again.");
        }

        const place = geoData.results[0];

        // Step 2: Get current weather using coordinates.
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather right now.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const info = getWeatherInfo(current.weather_code);

        // Step 3: Display the weather information.
        cityName.textContent = [place.name, place.admin1, place.country]
            .filter(Boolean)
            .join(", ");

        weatherDescription.textContent = info.text;
        weatherIcon.textContent =
            current.is_day === 0 && current.weather_code === 0
                ? "🌙"
                : info.icon;

        temperature.textContent = Math.round(current.temperature_2m);
        feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        wind.textContent = `${current.wind_speed_10m} km/h`;
        condition.textContent = info.text;

        weatherMessage.textContent =
            `Updated for ${place.name}. Temperature is in °C.`;
    } catch (error) {
        weatherMessage.textContent =
            error.message || "Something went wrong. Please try again.";
    } finally {
        weatherForm.querySelector("button").disabled = false;
    }
});

// Weather knowledge quiz.
const questions = [
    {
        question: "Which instrument measures temperature?",
        options: ["Barometer", "Thermometer", "Compass", "Hygrometer"],
        answer: 1
    },
    {
        question: "Which gas makes up most of Earth's atmosphere?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
        answer: 2
    },
    {
        question: "What causes most weather changes in the atmosphere?",
        options: ["The Sun's energy", "Moonlight", "Earthquakes", "Ocean salt"],
        answer: 0
    },
    {
        question: "Which instrument measures atmospheric pressure?",
        options: ["Thermometer", "Rain gauge", "Barometer", "Anemometer"],
        answer: 2
    },
    {
        question: "What is water falling from clouds as rain, snow or hail called?",
        options: ["Evaporation", "Condensation", "Precipitation", "Radiation"],
        answer: 2
    }
];

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const questionCounter = document.getElementById("questionCounter");
const scoreLabel = document.getElementById("scoreLabel");
const progressBar = document.getElementById("progressBar");
const quizFeedback = document.getElementById("quizFeedback");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");

let currentQuestion = 0;
let score = 0;
let answered = false;

function showQuestion() {
    answered = false;

    const item = questions[currentQuestion];

    questionCounter.textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    scoreLabel.textContent = `Score: ${score}`;
    progressBar.style.width =
        `${(currentQuestion / questions.length) * 100}%`;

    questionText.textContent = item.question;
    optionsContainer.innerHTML = "";
    quizFeedback.textContent = "";
    nextButton.disabled = true;
    nextButton.hidden = false;
    restartButton.hidden = true;

    item.options.forEach(function (option, index) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "option-button";
        button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

        button.addEventListener("click", function () {
            selectAnswer(index, button);
        });

        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedIndex, selectedButton) {
    if (answered) return;

    answered = true;

    const correctIndex = questions[currentQuestion].answer;
    const allButtons = optionsContainer.querySelectorAll("button");

    allButtons.forEach(function (button, index) {
        button.disabled = true;

        if (index === correctIndex) {
            button.classList.add("correct");
        }
    });

    if (selectedIndex === correctIndex) {
        score++;
        quizFeedback.textContent = "✓ Correct answer! Great job.";
        selectedButton.classList.add("correct");
    } else {
        selectedButton.classList.add("incorrect");
        quizFeedback.textContent =
            `Not quite! Correct answer: ${questions[currentQuestion].options[correctIndex]}.`;
    }

    scoreLabel.textContent = `Score: ${score}`;
    progressBar.style.width =
        `${((currentQuestion + 1) / questions.length) * 100}%`;

    nextButton.disabled = false;

    if (currentQuestion === questions.length - 1) {
        nextButton.textContent = "View Results →";
    } else {
        nextButton.textContent = "Next Question →";
    }
}

nextButton.addEventListener("click", function () {
    if (!answered) return;

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    questionCounter.textContent = "Quiz completed!";
    scoreLabel.textContent = `Score: ${score}/${questions.length}`;
    progressBar.style.width = "100%";

    questionText.textContent =
        score === questions.length
            ? "Perfect score! You're a weather expert! 🌟"
            : score >= 3
                ? "Great effort! Keep learning. ✨"
                : "Good try! Every quiz helps you learn. 🚀";

    optionsContainer.innerHTML = "";
    quizFeedback.textContent =
        `You answered ${score} out of ${questions.length} questions correctly.`;

    nextButton.hidden = true;
    restartButton.hidden = false;
}

restartButton.addEventListener("click", function () {
    currentQuestion = 0;
    score = 0;
    showQuestion();
});

// Display the first question when the page loads.
showQuestion();


