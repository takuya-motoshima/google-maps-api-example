const {Client} = require("@googlemaps/google-maps-services-js");
const {Command} = require('commander');

(async () => {
  try {
    // Parse arguments.
    const program = new Command();
    program
      .description('Postal Code Lookup by Address')
      .requiredOption('--address <string>', 'Address you want to find the postcode')
      .requiredOption('--key <string>', 'Google Maps API Key')
      // .option('--lang <string>', 'The language in which to return results. e.g. ja')
      // .option('--region <string>', 'The region code, specified as a ccTLD ("top-level domain") two-character value. e.g. jp')
      .parse();
    const opts = program.opts();

    // Google Maps API Client Instance.
    const client = new Client({});

    // Request location information that matches your address.
    const res = await client.geocode({params: {
      address: opts.address,
      key: opts.key,
      // language: opts.lang || undefined,
      // region: opts.region || undefined
    }});

    // If postal code not found.
    if (!res.data.results.length)
      return void console.log('Postal code not found');

    // Find the postal code.
    const postalCode = res.data.results[0].address_components.find(component => component.types.includes('postal_code'));
    if (!postalCode)
      return void console.log('Postal code not found');
    console.log(`Postal code ${postalCode.long_name} found`);
  } catch (err) {
    console.error(err.message);
  }
})();