// For streamlined VR development install the WebXR emulator extension
// https://github.com/MozillaReality/WebXR-emulator-extension

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkWebXRRenderWindowHelper from '@kitware/vtk.js/Rendering/WebXR/RenderWindowHelper';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract'; // Este es para la funcionalidad de AR para definir si hay un dispositivo especifico o mobile AR
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import { XrSessionTypes } from '@kitware/vtk.js/Rendering/WebXR/RenderWindowHelper/Constants';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkResourceLoader from '@kitware/vtk.js/IO/Core/ResourceLoader';

//Aqui vienen los botones para manejar las seciones
import controlPanel from './controller.html';

// Dynamically load WebXR polyfill from CDN for WebVR and Cardboard API backwards compatibility
if (navigator.xr === undefined) {
  vtkResourceLoader
    .loadScript(
      'https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.js'
    )
    .then(() => {
      // eslint-disable-next-line no-new, no-undef
      new WebXRPolyfill();
    });
}

// ----------------------------------------------------------------------------
// Parse URL parameters (para saber si es AR o VR)
// ----------------------------------------------------------------------------
const userParams = vtkURLExtract.extractURLParameters();
const requestedXrSessionType =
  userParams.xrSessionType ?? XrSessionTypes.MobileAR; // Si no se define, se asume MobileAR

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const XRHelper = vtkWebXRRenderWindowHelper.newInstance({
  renderWindow: fullScreenRenderer.getApiSpecificRenderWindow(),
});

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const coneSource = vtkConeSource.newInstance({ height: 100.0, radius: 50 });
const filter = vtkCalculator.newInstance();

filter.setInputConnection(coneSource.getOutputPort());

filter.setFormula({
  getArrays: (inputDataSets) => ({
    input: [],
    output: [
      {
        location: FieldDataTypes.CELL,
        name: 'Random',
        dataType: 'Float32Array',
        attribute: AttributeTypes.SCALARS,
      },
    ],
  }),
  evaluate: (arraysIn, arraysOut) => {
    const [scalars] = arraysOut.map((d) => d.getData());
    for (let i = 0; i < scalars.length; i++) {
      scalars[i] = Math.random();
    }
  },
});

const mapper = vtkMapper.newInstance();
mapper.setInputConnection(filter.getOutputPort());

const actor = vtkActor.newInstance();
actor.setMapper(mapper);
actor.setPosition(0.0, 0.0, -20.0);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

// Botón para AR
const arbutton = document.querySelector('.arbutton');
arbutton.disabled = !XRHelper.getXrSupported();

arbutton.addEventListener('click', (e) => {
  if (arbutton.textContent === 'Start AR') {
    XRHelper.startXR(XrSessionTypes.MobileAR); // Inicia sesión en AR
    arbutton.textContent = 'Exit AR';
  } else {
    XRHelper.stopXR();
    arbutton.textContent = 'Start AR';
  }
});

// Botón para VR
const vrbutton = document.querySelector('.vrbutton');
vrbutton.addEventListener('click', (e) => {
  if (vrbutton.textContent === 'Send To VR') {
    console.log("Test: " + navigator.xr)  // pruebas
    XRHelper.startXR(XrSessionTypes.HmdVR); // Inicia sesión en VR
    vrbutton.textContent = 'Return From VR';
  } else {
    XRHelper.stopXR();
    vrbutton.textContent = 'Send To VR';
  }
  console.log("Botón clickeado"); // pruebas
});

// Selector de representación (Points, Wireframe, Surface)
const representationSelector = document.querySelector('.representations');
representationSelector.addEventListener('change', (e) => {
  const newRepValue = Number(e.target.value);
  actor.getProperty().setRepresentation(newRepValue); // Cambia la representación
  renderWindow.render();
});

// Control de resolución del cono
const resolutionChange = document.querySelector('.resolution');
resolutionChange.addEventListener('input', (e) => {
  const resolution = Number(e.target.value);
  coneSource.setResolution(resolution); // Cambia la resolución del cono
  renderWindow.render();
});

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.source = coneSource;
global.mapper = mapper;
global.actor = actor;
global.renderer = renderer;
global.renderWindow = renderWindow;
