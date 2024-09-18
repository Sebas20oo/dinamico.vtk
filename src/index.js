import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';

// Definición de colores para los actores
const color_rgb = [
    [1.000000, 0.000000, 0.000000],  // Rojo
    [1.000000, 0.560784, 0.941176],  // Rosa
    [0.000000, 1.000000, 0.000000],  // Verde
    [0.000000, 0.000000, 1.000000],  // azul
    [2.550000, 1.650000, 0.000000],  // naranja
    [1.020000, 0.000000, 1.610000],  // morado
];

// Ruta base para los archivos VTP
const vtp_path = "./vtps/";

// Array con las rutas de los archivos VTP
const vtpFiles = [
    vtp_path + 'cow.vtp',
    vtp_path + 'earth.vtp',
    vtp_path + 'estructura.vtp',
    vtp_path + 'estructura_1.vtp',
    vtp_path + 'estructura_2.vtp',
    vtp_path + 'estructura_3.vtp',
];

// Crear la ventana de renderizado a pantalla completa
const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById('container'),
    containerStyle: { width: '100%', height: '100%' },
});
const renderer = fullScreenRenderWindow.getRenderer();
const renderWindow = fullScreenRenderWindow.getRenderWindow();

// Array para almacenar los actores (objetos 3D) cargados en la escena
const actors = [];

// Función para cargar archivos VTP
function loadVTP() {
    vtpFiles.forEach((file, index) => {
      console.log("file: " + file + " index: " + index); // para ver como se estan cargadon los vtp
        const reader = vtkXMLPolyDataReader.newInstance();
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();

        actor.setMapper(mapper);
        actor.getProperty().setColor(color_rgb[index]);
        actor.getProperty().setOpacity(1.0);

        mapper.setInputConnection(reader.getOutputPort());

        reader.setUrl(file).then(() => {
            reader.loadData().then(() => {
                renderer.addActor(actor);
                actors[index] = actor;

                renderer.resetCamera();
                renderWindow.render();
            });
        }).catch((error) => {
            console.error(`Error al cargar el archivo VTP: ${file}`, error);
        });
    });
}

// Función para generar el contenido del panel de control dinámicamente
function generateControlPanel() {
  

    vtpFiles.forEach((file, index) => {
        // Crear un checkbox para cada archivo .vtp
        const checkbox = document.createElement('input'); //tipo de entrada input tipo checkbox
        checkbox.type = 'checkbox';
        checkbox.id = `checkboxVTP-${index}`;  //
        checkbox.checked = true;

        // Crear las letras que aparecen a lado de cada checkbox
        const label = document.createElement('label');
        label.htmlFor = `checkboxVTP-${index}`;
        // escribe lo que viene guardado en "file" a partir de'/'  
        const tmp_array = file.split('/'); //split separa cada elemento en base al caracter que se defina en este caso "/" y te regresa un arreglo ejemplo: ./vtps/cow.vtp = [.,vtps,cow.vtp]
        label.textContent = `Mostrar ${tmp_array.pop()}`; //pop regresa el ultimo elemento del arreglo y lo elimina ejemplo:[.,vtps,cow.vtp] pop [.,vtps]

        // Crear un slider para la opacidad de cada archivo .vtp
        const opacitySlider = document.createElement('input');
        opacitySlider.type = 'range';
        opacitySlider.id = `opacityVTP-${index}`;
        opacitySlider.min = "0";
        opacitySlider.max = "1";
        opacitySlider.step = "0.1";
        opacitySlider.value = "1";

        // Crear las letras para el slider
        const opacityLabel = document.createElement('label');
        opacityLabel.htmlFor = `opacityVTP-${index}`;
        opacityLabel.textContent = ` Opacidad de ${file.split('/').pop()}: `; //lo mismo que lo anterior solo que junto

        // Añadir los elementos al control panel
        const controlPanel = document.getElementById("controlPanel");
        
        controlPanel.appendChild(checkbox);
        controlPanel.appendChild(label);
        controlPanel.appendChild(document.createElement('br'));
        controlPanel.appendChild(opacityLabel);
        controlPanel.appendChild(opacitySlider);
        controlPanel.appendChild(document.createElement('br'));
        controlPanel.appendChild(document.createElement('br'));
    });
}

// Función para crear controladores de eventos para el panel de control
function createControlEvents() {
    vtpFiles.forEach((_, index) => {   //forEach esta regresando el valor de File pero no se utiliza por lo que se define un "_" por convenio
        // Checkbox para controlar la visibilidad
        const checkbox = document.getElementById(`checkboxVTP-${index}`);
        checkbox.addEventListener('change', (event) => {
            const actor = actors[index];
            if (event.target.checked) {
                renderer.addActor(actor);  // Mostrar actor
            } else {
                renderer.removeActor(actor);  // Ocultar actor
            }
            renderer.resetCamera();  // Ajustar la cámara
            renderWindow.render();  // Volver a renderizar la escena
        });

        // Rango para controlar la opacidad
        const opacitySlider = document.getElementById(`opacityVTP-${index}`);
        opacitySlider.addEventListener('input', (event) => {  //Este event listener es input por el tipo de dato que recibe el slider
            const actor = actors[index];
            actor.getProperty().setOpacity(Number(event.target.value));
            renderWindow.render();  // Volver a renderizar la escena
        });
    });
}

// Ejecutar las funciones para cargar los archivos VTP y crear los eventos del panel de control
loadVTP();
generateControlPanel();
createControlEvents();
