const meals = document.getElementById("meals");
const category = document.getElementById("category");
const btn = document.getElementById("create");
const viewRecipesBtn = document.getElementById("view-recipes");
const numOfMeals = 3;

btn.addEventListener("click", () => {
  addMeals(category.value);
});

viewRecipesBtn.addEventListener("click", displaySavedRecipes);

async function getMeals(catVal) {
  let mealRes;
  if (catVal !== "Random") {
    mealRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${catVal}`
    );
  } else {
    let alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    mealRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${
        alphabet[Math.floor(Math.random() * 26)]
      }`
    );
  }
  const mealArr = await mealRes.json();
  return mealArr;
}

function truncateText(text, limit) {
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
}

async function addMeals(catVal) {
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden"); // Show the loader

  try {
    const mealList = await getMeals(catVal);
    const randomMeals = await createPlan(mealList);
    meals.innerHTML = "";

    for (let i = 0; i < numOfMeals; i++) {
      const insRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${randomMeals[i].strMeal}`
      );
      const insData = await insRes.json();
      const instructions = insData.meals[0].strInstructions;
      const shortInstructions = truncateText(instructions, 100);
      const encodedInstructions = encodeURIComponent(instructions); // Properly encode instructions

      meals.innerHTML += `
        <div class="meal-card">
            <h4>${randomMeals[i].strMeal}</h4>
            <img src="${randomMeals[i].strMealThumb}" alt="${randomMeals[i].strMeal}">
            <p class="short-instructions">${shortInstructions}<span class="dots">...</span></p>
            <p class="full-instructions hidden">${instructions.slice(100)}</p>
            <button class="toggle-instructions">Show More ⬇️</button>
            <button class="save-recipe iconbtn" onclick='saveRecipe(this, "${randomMeals[i].strMeal}", "${randomMeals[i].strMealThumb}", "${encodeURIComponent(instructions)}")'><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 100 100">
<polygon fill="#4b4dff" points="74,78 50,70 26,78 26,18 74,18"></polygon><path fill="#4343bf" d="M77,85.162l-27-9l-27,9V18h54V85.162z M50,69.838l21,7V24H29v52.838L50,69.838z"></path><rect width="70" height="10" x="15" y="18" fill="#ff8405"></rect><polygon fill="#edf7f5" points="66,45 62,45 62,37 54,37 54,33 66,33"></polygon>
</svg></button>
            <button class="share-recipe iconbtn" onclick='shareRecipe("${randomMeals[i].strMeal}", "${randomMeals[i].strMealThumb}", "${encodedInstructions}")'><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 100 100">
<rect width="48.754" height="10" x="26.123" y="35" fill="#ff8405" transform="rotate(-25.511 50.494 39.996)"></rect><rect width="9.999" height="48.995" x="45.75" y="36.253" fill="#ff8405" transform="rotate(-65.267 50.746 60.747)"></rect><circle cx="28.5" cy="50.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M28.5,67C19.402,67,12,59.598,12,50.5S19.402,34,28.5,34S45,41.402,45,50.5S37.598,67,28.5,67z M28.5,40C22.71,40,18,44.71,18,50.5S22.71,61,28.5,61S39,56.29,39,50.5S34.29,40,28.5,40z"></path><circle cx="72.5" cy="29.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M72.5,46C63.402,46,56,38.598,56,29.5S63.402,13,72.5,13S89,20.402,89,29.5S81.598,46,72.5,46z M72.5,19C66.71,19,62,23.71,62,29.5S66.71,40,72.5,40S83,35.29,83,29.5S78.29,19,72.5,19z"></path><circle cx="72.5" cy="70.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M72.5,87C63.402,87,56,79.598,56,70.5S63.402,54,72.5,54S89,61.402,89,70.5S81.598,87,72.5,87z M72.5,60C66.71,60,62,64.71,62,70.5S66.71,81,72.5,81S83,76.29,83,70.5S78.29,60,72.5,60z"></path><circle cx="28.5" cy="50.5" r="3.5" fill="#edf7f5"></circle><circle cx="72.5" cy="29.5" r="3.5" fill="#edf7f5"></circle><circle cx="72.5" cy="70.5" r="3.5" fill="#edf7f5"></circle>
</svg></button>
        </div>
      `;
    }

    attachToggleInstructions(); // Attach event listeners to "Show More" buttons
  } catch (error) {
    console.error("Error loading meals:", error);
  } finally {
    loader.classList.add("hidden"); // Hide the loader
  }
}

function attachToggleInstructions() {
  const toggleButtons = document.querySelectorAll(".toggle-instructions");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const shortInstructions = this.previousElementSibling.previousElementSibling;
      const fullInstructions = this.previousElementSibling;

      if (fullInstructions.classList.contains("hidden")) {
        shortInstructions.classList.add("hidden");
        fullInstructions.classList.remove("hidden");
        this.textContent = "Show Less ⬆️";
      } else {
        shortInstructions.classList.remove("hidden");
        fullInstructions.classList.add("hidden");
        this.textContent = "Show More ⬇️";
      }
    });
  });
}

function createPlan(mList) {
  let randomizedList = [];
  let lengthOfList = mList.meals.length;

  for (let i = 0; i < numOfMeals; i++) {
    let flag = false;
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * lengthOfList);
      if (randomizedList.includes(mList.meals[randomNumber])) {
        continue;
      } else {
        randomizedList[i] = mList.meals[randomNumber];
        flag = true;
      }
    } while (!flag);
  }
  return randomizedList;
}

function saveRecipe(button, name, img, instructions) {
  const recipe = { name, img, instructions };
  const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
  savedRecipes.unshift(recipe); // First Come Last Out
  localStorage.setItem("recipes", JSON.stringify(savedRecipes));
  button.textContent = "Saved";
  button.disabled = true;
  showSuccessMessage("Recipe saved successfully!");
}

function displaySavedRecipes() {
  const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
  meals.innerHTML = "";

  if (savedRecipes.length === 0) {
    meals.innerHTML = "<p>No saved recipes found.</p>";
    return;
  }

  meals.innerHTML = '<div class="grid-container">';
  savedRecipes.forEach((recipe, index) => {
    meals.innerHTML += `
            <div class="meal-card">
                <h4>${recipe.name}</h4>
                <img src="${recipe.img}" alt="${recipe.name}">
                <p class="short-instructions">${truncateText(
                  decodeURIComponent(recipe.instructions),
                  150
                )}<span class="dots">...</span></p>
                <p class="full-instructions hidden">${decodeURIComponent(
                  recipe.instructions
                )}</p>
                <button onclick="toggleInstructions(this)">Show More ⬇️</button>
                <button class="delete-recipe iconbtn" onclick="deleteRecipe(${index})"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 100 100">
<path fill="#4b4dff" d="M66,80H28V26h44v48C72,77.314,69.314,80,66,80z"></path><path fill="#4343bf" d="M63,27H37v-7c0-5.514,4.486-10,10-10h6c5.514,0,10,4.486,10,10V27z M43,21h14v-1 c0-2.206-1.794-4-4-4h-6c-2.206,0-4,1.794-4,4V21z"></path><path fill="#4343bf" d="M75,83H25V23h50V83z M31,77h38V29H31V77z"></path><polygon fill="#3abcf8" points="79,87 31,87 31,77 69,77 69,28 79,28"></polygon><rect width="66" height="10" x="19" y="21" fill="#ff8405"></rect><rect width="4" height="30" x="38" y="39" fill="#edf7f5"></rect><rect width="4" height="30" x="58" y="39" fill="#edf7f5"></rect><rect width="4" height="30" x="48" y="39" fill="#edf7f5"></rect>
</svg></button>
                <button class="share-recipe iconbtn" onclick='shareRecipe("${recipe.name}", "${recipe.img}", "${recipe.instructions}")'> <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 100 100">
<rect width="48.754" height="10" x="26.123" y="35" fill="#ff8405" transform="rotate(-25.511 50.494 39.996)"></rect><rect width="9.999" height="48.995" x="45.75" y="36.253" fill="#ff8405" transform="rotate(-65.267 50.746 60.747)"></rect><circle cx="28.5" cy="50.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M28.5,67C19.402,67,12,59.598,12,50.5S19.402,34,28.5,34S45,41.402,45,50.5S37.598,67,28.5,67z M28.5,40C22.71,40,18,44.71,18,50.5S22.71,61,28.5,61S39,56.29,39,50.5S34.29,40,28.5,40z"></path><circle cx="72.5" cy="29.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M72.5,46C63.402,46,56,38.598,56,29.5S63.402,13,72.5,13S89,20.402,89,29.5S81.598,46,72.5,46z M72.5,19C66.71,19,62,23.71,62,29.5S66.71,40,72.5,40S83,35.29,83,29.5S78.29,19,72.5,19z"></path><circle cx="72.5" cy="70.5" r="13.5" fill="#4b4dff"></circle><path fill="#4343bf" d="M72.5,87C63.402,87,56,79.598,56,70.5S63.402,54,72.5,54S89,61.402,89,70.5S81.598,87,72.5,87z M72.5,60C66.71,60,62,64.71,62,70.5S66.71,81,72.5,81S83,76.29,83,70.5S78.29,60,72.5,60z"></path><circle cx="28.5" cy="50.5" r="3.5" fill="#edf7f5"></circle><circle cx="72.5" cy="29.5" r="3.5" fill="#edf7f5"></circle><circle cx="72.5" cy="70.5" r="3.5" fill="#edf7f5"></circle>
</svg> </button>
            </div>
        `;
  });
  meals.innerHTML += "</div>";
}

function toggleInstructions(button) {
  const shortInstructions =
    button.previousElementSibling.previousElementSibling;
  const fullInstructions = button.previousElementSibling;

  if (fullInstructions.classList.contains("hidden")) {
    shortInstructions.classList.add("hidden");
    fullInstructions.classList.remove("hidden");
    button.textContent = "Show Less ⬆️";
  } else {
    shortInstructions.classList.remove("hidden");
    fullInstructions.classList.add("hidden");
    button.textContent = "Show More ⬇️";
  }
}

function deleteRecipe(index) {
  let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
  savedRecipes.splice(index, 1); // Remove the recipe at the specified index
  localStorage.setItem("recipes", JSON.stringify(savedRecipes)); // Update localStorage
  displaySavedRecipes(); // Refresh the displayed recipes
  showSuccessMessage("Recipe deleted successfully!");
}

function showSuccessMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.textContent = message;
  alertDiv.className = "success-toast";
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

// Share Recipe Function
function shareRecipe(name, img, instructions) {
  const baseUrl = "https://zaikaway.vercel.app/"; // Replace with your hosted domain
  const recipeUrl = `${baseUrl}?recipe=${encodeURIComponent(name)}`; // Construct proper HTTP/HTTPS URL

  const shareData = {
    title: name,
    text: `Check out this recipe: ${name}\n\nInstructions:\n${instructions}`,
    url: recipeUrl, // Use the constructed recipe URL
  };

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => console.log("Recipe shared successfully!"))
      .catch((error) => console.error("Error sharing:", error));
  } else {
    navigator.clipboard
      .writeText(recipeUrl)
      .then(() => {
        alert("Recipe URL copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying URL:", error);
      });
  }
}

// On page load, check if a recipe is being accessed via URL
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeName = urlParams.get("recipe");

  if (recipeName) {
    // Decode the recipe name from the URL
    const decodedRecipeName = decodeURIComponent(recipeName);

    // Fetch and display the specific recipe based on its name
    fetchRecipeByName(decodedRecipeName);
  }
};

// Function to fetch and display the recipe based on its name
function fetchRecipeByName(name) {
  fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
      name
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        displayRecipe(meal);
      } else {
        console.error("No recipe found for:", name);
        alert("Recipe not found.");
      }
    })
    .catch((error) => console.error("Error fetching recipe:", error));
}

// Function to display the fetched recipe on the page
function displayRecipe(meal) {
  const mealsContainer = document.getElementById("meals");
  mealsContainer.innerHTML = `
        <div class="meal-card">
            <h4>${meal.strMeal}</h4>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p class="short-instructions">${truncateText(
              meal.strInstructions,
              100
            )}<span class="dots">...</span></p>
            <p class="full-instructions hidden">${meal.strInstructions.slice(
              100
            )}</p>
            <button class="toggle-instructions">Show More ⬇️</button>
            <button class="save-recipe iconbtn" onclick='saveRecipe(this, "${
              meal.strMeal
            }", "${meal.strMealThumb}", "${encodeURIComponent(
    meal.strInstructions
  )}")'>Save</button>
            <button class="share-recipe iconbtn" onclick='shareRecipe("${
              meal.strMeal
            }", "${meal.strMealThumb}", "${meal.strInstructions}")'>Share</button>
        </div>
    `;

  // Attach toggle functionality to the "Show More" button
  attachToggleInstructions();
}

const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
  themeToggle.innerHTML =
    '<img width="30" height="30" src="https://img.icons8.com/avantgarde/100/sun.png" alt="sun"/>';
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    themeToggle.innerHTML =
      '<img width="30" height="30" src="https://img.icons8.com/avantgarde/100/sun.png" alt="sun"/>';
  } else {
    localStorage.setItem("darkMode", "disabled");
    themeToggle.innerHTML =
      '<img width="30" height="30" src="https://img.icons8.com/avantgarde/100/full-moon.png" alt="full-moon"/>';
  }
})

//installinf app

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((reg) => console.log("Service Worker registered", reg))
    .catch((err) => console.log("Service Worker registration failed", err));
}

let deferredPrompt;
const installButton = document.createElement("button");
installButton.textContent = "Install App";
installButton.classList.add("btn");
document.body.appendChild(installButton);

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = "block";
});

installButton.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      deferredPrompt = null;
    });
  }
});
