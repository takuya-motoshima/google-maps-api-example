/**
  * Load Google Maps API.
  */
async function loadMap() {
  return new Promise(async (rslv, rej) => {

    // Authentication error.
    window.gm_authFailure = () => rej(new Error('Invalid Google Maps API key'));

    // Google Maps API Loader.
    const loader = new google.maps.plugins.loader.Loader({apiKey: key.value, version: 'weekly'});

    // Load the Google Maps API.
    await loader.load();

    // Delete map node.
    let node = wrapper.querySelector('.map');
    if (node)
      node.remove();

    // Create a map node.
    node = document.createElement('div');
    node.classList.add('map', 'fade');
    wrapper.appendChild(node);

    // Create a map instance.
    const map = new google.maps.Map(node, {
      center: {lat: 0, lng: 0},
      zoom: 17,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false
    });
    const listener = map.addListener('tilesloaded', () => {
      google.maps.event.removeListener(listener);
      rslv({map, node});
    });
  });
}

const form = document.querySelector('#form');
const submit = form.querySelector('[type="submit"]');
const spinner = submit.querySelector('.spinner-border');
const address = document.querySelector('#address');
const key = document.querySelector('#key');
const wrapper = document.querySelector('#wrapper');
const foundPostalCode = document.querySelector('#foundPostalCode');
const remember = document.querySelector('#remember');

// Restore last input of "remember Key" radio button. 
if (localStorage.getItem('rememberKey') == 1) {
  remember.checked = true;
  if (localStorage.getItem('key'))
    key.value = localStorage.getItem('key');
}

// Submit search form.
form.addEventListener('submit', async evnt => {
  evnt.preventDefault();
  submit.disabled = true;
  spinner.classList.remove('d-none');
  foundPostalCode.parentNode.classList.remove('show');
  try {
    // Load Google Maps API.
    const {map, node} = await loadMap();

    // Remember the key.
    if (remember.checked)
      localStorage.setItem('key', key.value);

    // Request geocode.
    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({address: address.value});

    // If postal code not found.
    if (!res.results.length)
      return void alert('Postal code not found');
    
    // Find the postal code.
    const postalCode = res.results[0].address_components.find(component => component.types.includes('postal_code'));
    if (!postalCode)
      return void alert('Postal code not found');
    foundPostalCode.value = postalCode.long_name;
    foundPostalCode.parentNode.classList.add('show');

    // Draw a map of the location found.
    map.setCenter(res.results[0].geometry.location);
    new google.maps.Marker({position: res.results[0].geometry.location, map});
    node.classList.add('show');
  } catch (err) {
    alert(err.message);
  } finally {
    submit.disabled = false;
    spinner.classList.add('d-none');
  }
}, {passive: false});

// Change whether to remember the API key.
remember.addEventListener('change', () => {
  localStorage.setItem('rememberKey', remember.checked ? 1 : 0);

  // Ask if you want to delete the key you remembered when you unchecked.
  if (!remember.checked && window.confirm('Do you want to delete the memorized key as well?'))
    localStorage.removeItem('key');
}, {passive: true});