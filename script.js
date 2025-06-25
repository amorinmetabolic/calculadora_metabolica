// Constantes para cálculos metabólicos
const ATP_CONSTANTS = {
    // Valores aproximados de producción de ATP por gramo de macronutriente
    CARBS_ATP_PER_GRAM: 0.167, // ~30-32 ATP/mol glucosa (180g/mol) ≈ 0.167 mol ATP/g
    FATS_ATP_PER_GRAM: 0.408, // ~106 ATP/mol ácido palmítico (256g/mol) ≈ 0.408 mol ATP/g
    PROTEINS_ATP_PER_GRAM: 0.132, // Valor aproximado considerando costo de urea
    
    // Equivalencia energética del ATP
    ATP_KJ_PER_MOL: 30.5, // kJ/mol ATP
    KJ_TO_KCAL: 0.239, // Factor de conversión de kJ a kcal
};

// Configuración de la API de USDA
const USDA_API = {
    BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
    API_KEY: '2yHDUCdum0gRJvoCnSiBWICzyGc8VbAfTB9oy9Ow'
};

// Elementos del DOM
const DOM = {
    // Elementos de búsqueda
    foodSearch: document.getElementById('food-search'),
    searchBtn: document.getElementById('search-btn'),
    searchResults: document.getElementById('search-results'),
    selectedFoodInfo: document.getElementById('selected-food-info'),
    selectedFoodName: document.getElementById('selected-food-name'),
    
    // Campos de datos del alimento
    foodQuantity: document.getElementById('food-quantity'),
    carbs: document.getElementById('carbs'),
    fats: document.getElementById('fats'),
    proteins: document.getElementById('proteins'),
    fiber: document.getElementById('fiber'),
    calculateBtn: document.getElementById('calculate-btn'),
    
    // Campos de datos personales
    showPersonalData: document.getElementById('show-personal-data'),
    personalDataFields: document.getElementById('personal-data-fields'),
    genderMale: document.getElementById('gender-male'),
    genderFemale: document.getElementById('gender-female'),
    age: document.getElementById('age'),
    weight: document.getElementById('weight'),
    height: document.getElementById('height'),
    calculateBmrBtn: document.getElementById('calculate-bmr-btn'),
    
    // Elementos de resultados
    resultsSection: document.getElementById('results'),
    atpTotal: document.getElementById('atp-total'),
    energyKj: document.getElementById('energy-kj'),
    energyKcal: document.getElementById('energy-kcal'),
    carbsAtp: document.getElementById('carbs-atp'),
    fatsAtp: document.getElementById('fats-atp'),
    proteinsAtp: document.getElementById('proteins-atp'),
    carbsBar: document.getElementById('carbs-bar'),
    fatsBar: document.getElementById('fats-bar'),
    proteinsBar: document.getElementById('proteins-bar'),
    bmrResults: document.getElementById('bmr-results'),
    bmrValue: document.getElementById('bmr-value'),
    
    // Navegación
    navLinks: document.querySelectorAll('nav a'),
};

// Estado de la aplicación
let appState = {
    selectedFood: null,
    lastCalculation: null,
};

// Inicialización de la aplicación
function initApp() {
    // Configurar event listeners
    DOM.searchBtn.addEventListener('click', handleFoodSearch);
    DOM.calculateBtn.addEventListener('click', calculateATP);
    DOM.showPersonalData.addEventListener('change', togglePersonalDataFields);
    DOM.calculateBmrBtn.addEventListener('click', calculateBMR);
    DOM.foodQuantity.addEventListener('input', updateNutrientValues);
    
    // Configurar navegación
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            // Desactivar todos los enlaces y activar el actual
            DOM.navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Desplazarse al elemento objetivo
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Comprobar si se ha configurado la API key
    if (!USDA_API.API_KEY) {
        showApiKeyWarning();
    }
}

// Mostrar advertencia sobre la API key
function showApiKeyWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'card';
    warningDiv.style.backgroundColor = '#fff3cd';
    warningDiv.style.color = '#856404';
    warningDiv.style.padding = '1rem';
    warningDiv.style.marginBottom = '1rem';
    warningDiv.style.borderRadius = 'var(--border-radius)';
    warningDiv.style.border = '1px solid #ffeeba';
    
    warningDiv.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> Configuración Requerida</h3>
        <p>Para utilizar la función de búsqueda de alimentos, necesitas obtener una clave API gratuita de USDA FoodData Central y configurarla en el archivo script.js.</p>
        <p>Puedes obtener tu clave API registrándote en: <a href="https://fdc.nal.usda.gov/api-key-signup.html" target="_blank">USDA FoodData Central API Key Signup</a></p>
        <p>Una vez obtenida, reemplaza el valor vacío de <code>USDA_API.API_KEY</code> en el archivo script.js.</p>
    `;
    
    // Insertar la advertencia al principio del contenedor principal
    const mainContainer = document.querySelector('main .container');
    mainContainer.insertBefore(warningDiv, mainContainer.firstChild);
}

// Manejar la búsqueda de alimentos
async function handleFoodSearch() {
    const searchTerm = DOM.foodSearch.value.trim();
    
    if (!searchTerm) {
        showMessage('Por favor, ingresa un término de búsqueda.', 'warning');
        return;
    }
    
    if (!USDA_API.API_KEY) {
        showMessage('Se requiere una clave API para realizar búsquedas. Por favor, configura tu clave API.', 'error');
        return;
    }
    
    try {
        showMessage('Buscando alimentos...', 'info');
        
        const url = `${USDA_API.BASE_URL}/foods/search?api_key=${USDA_API.API_KEY}&query=${encodeURIComponent(searchTerm)}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)&pageSize=50`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            displaySearchResults(data.foods);
        } else {
            showMessage('No se encontraron alimentos que coincidan con tu búsqueda. Intenta con otro término.', 'warning');
        }
    } catch (error) {
        console.error('Error al buscar alimentos:', error);
        showMessage(`Error al buscar alimentos: ${error.message}`, 'error');
    }
}

// Mostrar resultados de búsqueda
function displaySearchResults(foods) {
    DOM.searchResults.innerHTML = '';
    DOM.searchResults.classList.remove('hidden');
    
    const resultsList = document.createElement('div');
    
    foods.forEach(food => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <strong>${food.description}</strong>
            <div><small>${food.brandName || 'USDA'}</small></div>
        `;
        
        resultItem.addEventListener('click', () => selectFood(food));
        resultsList.appendChild(resultItem);
    });
    
    DOM.searchResults.appendChild(resultsList);
}

// Seleccionar un alimento de los resultados
function selectFood(food) {
    appState.selectedFood = food;
    
    // Mostrar información del alimento seleccionado
    DOM.selectedFoodInfo.classList.remove('hidden');
    DOM.selectedFoodName.textContent = food.description;
    
    // Extraer nutrientes
    const nutrients = food.foodNutrients;
    let carbsValue = 0;
    let fatsValue = 0;
    let proteinsValue = 0;
    let fiberValue = 0;
    
    // Mapeo de IDs de nutrientes de USDA FoodData Central
    // Estos IDs pueden variar, se deben ajustar según la documentación actual de la API
    nutrients.forEach(nutrient => {
        const nutrientId = nutrient.nutrientId;
        const value = nutrient.value || 0;
        
        // Carbohidratos (por diferencia)
        if (nutrientId === 1005) {
            carbsValue = value;
        }
        // Grasas totales
        else if (nutrientId === 1004) {
            fatsValue = value;
        }
        // Proteínas
        else if (nutrientId === 1003) {
            proteinsValue = value;
        }
        // Fibra dietética total
        else if (nutrientId === 1079) {
            fiberValue = value;
        }
    });
    
    // Actualizar campos de nutrientes
    DOM.carbs.value = carbsValue;
    DOM.fats.value = fatsValue;
    DOM.proteins.value = proteinsValue;
    DOM.fiber.value = fiberValue;
    
    // Ocultar resultados de búsqueda
    DOM.searchResults.classList.add('hidden');
    
    showMessage(`Alimento seleccionado: ${food.description}`, 'success');
}

// Actualizar valores de nutrientes cuando cambia la cantidad
function updateNutrientValues() {
    if (!appState.selectedFood) return;
    
    const quantity = parseFloat(DOM.foodQuantity.value) || 0;
    const ratio = quantity / 100; // Los valores nutricionales son por 100g
    
    // Actualizar campos con los valores escalados
    DOM.carbs.value = (parseFloat(DOM.carbs.value) * ratio).toFixed(1);
    DOM.fats.value = (parseFloat(DOM.fats.value) * ratio).toFixed(1);
    DOM.proteins.value = (parseFloat(DOM.proteins.value) * ratio).toFixed(1);
    DOM.fiber.value = (parseFloat(DOM.fiber.value) * ratio).toFixed(1);
}

// Calcular ATP a partir de los macronutrientes
function calculateATP() {
    // Obtener valores de los campos
    const carbs = parseFloat(DOM.carbs.value) || 0;
    const fats = parseFloat(DOM.fats.value) || 0;
    const proteins = parseFloat(DOM.proteins.value) || 0;
    const fiber = parseFloat(DOM.fiber.value) || 0;
    
    // Calcular carbohidratos netos (restar fibra)
    const netCarbs = Math.max(0, carbs - fiber);
    
    // Calcular ATP para cada macronutriente (en moles)
    const carbsATP = netCarbs * ATP_CONSTANTS.CARBS_ATP_PER_GRAM;
    const fatsATP = fats * ATP_CONSTANTS.FATS_ATP_PER_GRAM;
    const proteinsATP = proteins * ATP_CONSTANTS.PROTEINS_ATP_PER_GRAM;
    
    // Calcular ATP total
    const totalATP = carbsATP + fatsATP + proteinsATP;
    
    // Calcular equivalente energético
    const energyKJ = totalATP * ATP_CONSTANTS.ATP_KJ_PER_MOL;
    const energyKcal = energyKJ * ATP_CONSTANTS.KJ_TO_KCAL;
    
    // Guardar resultados en el estado
    appState.lastCalculation = {
        totalATP,
        energyKJ,
        energyKcal,
        carbsATP,
        fatsATP,
        proteinsATP
    };
    
    // Mostrar resultados
    displayResults();
}

// Mostrar resultados de cálculo
function displayResults() {
    const results = appState.lastCalculation;
    
    if (!results) return;
    
    // Mostrar sección de resultados
    DOM.resultsSection.classList.remove('hidden');
    DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Actualizar valores
    DOM.atpTotal.textContent = results.totalATP.toFixed(2);
    DOM.energyKj.textContent = results.energyKJ.toFixed(1);
    DOM.energyKcal.textContent = results.energyKcal.toFixed(1);
    
    // Actualizar desglose por macronutriente
    DOM.carbsAtp.textContent = `${results.carbsATP.toFixed(2)} moles (${((results.carbsATP / results.totalATP) * 100).toFixed(1)}%)`;
    DOM.fatsAtp.textContent = `${results.fatsATP.toFixed(2)} moles (${((results.fatsATP / results.totalATP) * 100).toFixed(1)}%)`;
    DOM.proteinsAtp.textContent = `${results.proteinsATP.toFixed(2)} moles (${((results.proteinsATP / results.totalATP) * 100).toFixed(1)}%)`;
    
    // Actualizar barras de progreso
    DOM.carbsBar.style.width = `${(results.carbsATP / results.totalATP) * 100}%`;
    DOM.fatsBar.style.width = `${(results.fatsATP / results.totalATP) * 100}%`;
    DOM.proteinsBar.style.width = `${(results.proteinsATP / results.totalATP) * 100}%`;
    
    // Aplicar animación
    const elements = [DOM.atpTotal, DOM.energyKj, DOM.energyKcal, DOM.carbsBar, DOM.fatsBar, DOM.proteinsBar];
    elements.forEach(el => {
        el.classList.remove('fade-in');
        void el.offsetWidth; // Forzar reflow
        el.classList.add('fade-in');
    });
    
    showMessage('Cálculo de ATP completado con éxito.', 'success');
}

// Calcular Tasa Metabólica Basal (BMR)
function calculateBMR() {
    // Verificar que todos los campos necesarios estén completos
    if (!DOM.weight.value || !DOM.height.value || !DOM.age.value || (!DOM.genderMale.checked && !DOM.genderFemale.checked)) {
        showMessage('Por favor, completa todos los campos de datos personales.', 'warning');
        return;
    }
    
    const weight = parseFloat(DOM.weight.value);
    const height = parseFloat(DOM.height.value);
    const age = parseInt(DOM.age.value);
    const isMale = DOM.genderMale.checked;
    
    // Fórmula de Harris-Benedict revisada
    let bmr;
    if (isMale) {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Mostrar resultados
    DOM.bmrResults.classList.remove('hidden');
    DOM.bmrValue.textContent = bmr.toFixed(0);
    
    showMessage('Tasa Metabólica Basal calculada con éxito.', 'success');
}

// Alternar visibilidad de campos de datos personales
function togglePersonalDataFields() {
    if (DOM.showPersonalData.checked) {
        DOM.personalDataFields.classList.remove('hidden');
    } else {
        DOM.personalDataFields.classList.add('hidden');
        DOM.bmrResults.classList.add('hidden');
    }
}

// Mostrar mensajes al usuario
function showMessage(message, type = 'info') {
    // Crear elemento de mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.right = '20px';
    messageElement.style.padding = '1rem';
    messageElement.style.borderRadius = 'var(--border-radius)';
    messageElement.style.maxWidth = '300px';
    messageElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    messageElement.style.zIndex = '1000';
    messageElement.style.transition = 'all 0.3s ease-in-out';
    
    // Establecer colores según el tipo de mensaje
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = 'var(--success-color)';
            messageElement.style.color = 'white';
            break;
        case 'warning':
            messageElement.style.backgroundColor = 'var(--warning-color)';
            messageElement.style.color = 'white';
            break;
        case 'error':
            messageElement.style.backgroundColor = 'var(--danger-color)';
            messageElement.style.color = 'white';
            break;
        default: // info
            messageElement.style.backgroundColor = 'var(--primary-color)';
            messageElement.style.color = 'white';
    }
    
    messageElement.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}" style="margin-right: 0.5rem;"></i>
            <div>${message}</div>
        </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(messageElement);
    
    // Animar entrada
    setTimeout(() => {
        messageElement.style.transform = 'translateY(-10px)';
    }, 10);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 5000);
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initApp);