# ATP NutriCalc: Calculadora Científica Metabólica

ATP NutriCalc es una aplicación web interactiva diseñada para estimar con precisión la generación de ATP (trifosfato de adenosina) a partir de alimentos completos, considerando las rutas metabólicas reales y la degradación de los nutrientes hasta CO₂ y H₂O o metabolitos residuales.

## Características Principales

- **Cálculo Preciso de ATP**: Estimación de la producción de ATP basada en las rutas metabólicas reales para carbohidratos, grasas y proteínas.
- **Búsqueda de Alimentos**: Integración con la base de datos USDA FoodData Central para obtener información nutricional precisa.
- **Desglose Detallado**: Visualización del aporte de ATP por cada macronutriente.
- **Cálculo de TMB**: Estimación opcional de la Tasa Metabólica Basal basada en datos personales.
- **Diseño Responsivo**: Interfaz adaptable a diferentes dispositivos (móviles, tablets, desktops).

## Fundamento Científico

A diferencia de las calculadoras tradicionales de calorías que utilizan los valores Atwater, ATP NutriCalc se enfoca en la Energía Neta Metabolizable (NME) basada en la producción real de ATP, ofreciendo una visión más precisa del valor energético de los alimentos para el cuerpo humano.

Los cálculos se basan en modelos bioquímicos que consideran:

- **Carbohidratos**: Glucólisis + ciclo de Krebs + fosforilación oxidativa (~30-32 ATP/mol glucosa)
- **Grasas**: Beta-oxidación + ciclo de Krebs + fosforilación oxidativa (~106 ATP/mol ácido palmítico)
- **Proteínas**: Desaminación + ciclo de Krebs + fosforilación oxidativa, con ajustes para el costo energético de la síntesis de urea

## Requisitos Previos

Para utilizar la función de búsqueda de alimentos, necesitas obtener una clave API gratuita de USDA FoodData Central:

1. Visita [USDA FoodData Central API Key Signup](https://fdc.nal.usda.gov/api-key-signup.html)
2. Completa el formulario de registro
3. Recibirás tu clave API por correo electrónico
4. Configura la clave API en el archivo `script.js`:
   ```javascript
   const USDA_API = {
       BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
       API_KEY: 'TU_CLAVE_API_AQUÍ', // Reemplaza con tu clave API
   };
   ```

## Instrucciones de Uso

1. **Búsqueda de Alimentos**:
   - Ingresa el nombre del alimento en inglés (ej. "Apple", "Chicken Breast")
   - Haz clic en "Buscar Alimento"
   - Selecciona el alimento deseado de los resultados

2. **Ajuste de Cantidad**:
   - Modifica la cantidad en gramos según necesites

3. **Cálculo de ATP**:
   - Haz clic en "Calcular ATP"
   - Visualiza los resultados detallados

4. **Datos Personales (Opcional)**:
   - Activa la casilla "Incluir datos personales"
   - Completa tus datos (género, edad, peso, altura)
   - Haz clic en "Estimar Tasa Metabólica Basal"

## Tecnologías Utilizadas

- HTML5
- CSS3 (Flexbox, Grid, Variables CSS, Media Queries)
- JavaScript (ES6+)
- API de USDA FoodData Central

## Limitaciones

- Los cálculos son aproximaciones basadas en modelos bioquímicos generales
- La eficiencia real de la producción de ATP puede variar según factores individuales
- La base de datos USDA puede no contener todos los alimentos, especialmente preparaciones específicas o regionales

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar esta aplicación, puedes:

1. Mejorar los modelos de cálculo de ATP
2. Añadir soporte para más bases de datos nutricionales
3. Implementar funcionalidades adicionales (ej. guardar alimentos favoritos, crear recetas)
4. Mejorar la interfaz de usuario y experiencia de usuario

## Licencia

Este proyecto está disponible como código abierto bajo la licencia MIT.

## Contacto

Para preguntas, sugerencias o colaboraciones, por favor contacta a través de [correo electrónico/GitHub/etc.].