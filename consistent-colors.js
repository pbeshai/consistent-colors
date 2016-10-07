

var hash;
var values;
var colors;
var mapped;

var hashInput;
var valuesInput;
var colorsInput;
var outputContainer;
var outputTable;

function readInputs() {
  // read in values from text areas
  eval(`hash = ${hashInput.node().value.trim()}`);
  values = valuesInput.node().value.trim().split('\n');
  colors = colorsInput.node().value.trim().split('\n');

  // compute mapping using hash function
  mapped = colorsFor(colors, values, hash);

  console.log('got hash =', hash);
  console.log('got values =', values);
  console.log('got colors =', colors);
  console.log('got mapped =', mapped);
}

function updateTable(overlaps) {
  // remove existing rows
  const binding = outputTable.select('tbody').selectAll('tr').data(overlaps, d => d.key);

  const entering = binding.enter().append('tr').each(function (d) {
    var colorIndex = d.key;
    var values = d.values;
    var tr = d3.select(this);
    tr.append('td').text(colorIndex).style('background', colors[colorIndex]);

    var coloredValues = values.map(value => `<span class='color-value-text' style='color: ${mapped[value]}'>${value}</span>`);
    tr.append('td').classed('values-td', true).html(coloredValues.join(''));
  });

  binding.merge(entering).each(function (d) {
    var colorIndex = d.key;
    var values = d.values;
    var tr = d3.select(this);
    var coloredValues = values.map(value => `<span class='color-value-text' style='color: ${mapped[value]}'>${value}</span>`);
    tr.select('.values-td').html(coloredValues.join(''));
  })
}


function update() {
  // read in the values and compute the mapping
  readInputs();

  // get the data mapped from has index to values
  const overlaps = d3.nest()
    .key((d) => hash(d, colors.length))
    .entries(values);

  colors.forEach((color, i) => {
    if (!overlaps.find(overlap => +overlap.key === i)) {
      overlaps.push({ key: i, values: [] });
    }
  });

  overlaps.sort((a, b) => a.key - b.key);


  // output the mapping
  updateTable(overlaps);
}


function setup() {
  // get the d3 selection of input elements
  hashInput = d3.select('.hash-function-input');
  valuesInput = d3.select('.data-values-input');
  colorsInput = d3.select('.colors-input');
  outputContainer = d3.select('.output');
  outputTable = outputContainer.select('table');

  d3.select('.recompute').on('click', update);
  update();
}



/**
 * Change brightness of overlapping colors.
 * @param {Array} colors Array of d3.color values
 * @param {Array} Array of overlap objects. Overlap created using d3.nest
 *  will have a `values` array attribute - an entry for each value in colors
 *  that are the same color. Each entry in values has a `index` attribute indicating
 *  the position in `colors` for that color.
 * @return {Array} Array of d3.color values altered so that none overlap.
 */
function varyColor(colors, overlaps) {
  overlaps.forEach((overlap) => {
    const length = overlap.values.length;
    if (length > 1) {
      let brightenToggle = true;
      let k = 1.0;
      // Start at the 2nd overlapping index
      for (let i = 1; i < length; i++) {
        const index = overlap.values[i].index;

        // brighten / darken matching colors.
        // Alternate between brightening and darkening.
        colors[index] = (brightenToggle) ? colors[index].brighter(k) : colors[index].darker(k);
        brightenToggle = !brightenToggle;
        // amount to brigten/darken by increases if we have used that same value
        // to brigten and darken already.
        if (brightenToggle) {
          k += 1.0;
        }
      }
    }
  });

  return colors;
}

/**
 * Create an array of colors, one for each entry in values. Colors will not overlap,
 * but remain consistent based on `hashFunction`.
 * @param {Array} values Array to extract colors for.
 * @param {Function} valueAccessor Function to pull out the value from values with.
 *  defaults to identity function.
 * @param {Function} hashFunction Function to convert value to an index into color array.
 *  defaults to hashAsn which expects value to be ASN strings.
 * @return {Array} Array of Color strings in order of values.
 */
function extractColors(colors, values, hashFunction, valueAccessor = d => d) {
  const maxCount = colors.length;
  const indexes = values.map((v, i) => ({ index: i, hash: hashFunction(valueAccessor(v), maxCount) }));

  const mappedColors = indexes.map((h) => d3.color(colors[h.hash]));

  // groups by hash value - so we can easily find duplicate colors.
  // alternative would be to rely on comparing d3.color values inside `varyColor`
  const overlaps = d3.nest()
    .key((d) => d.hash)
    .entries(indexes);

  const variedColors = varyColor(mappedColors, overlaps);

  return variedColors.map((c) => c.toString());
}

/**
 * Create an object of colors, with entries in `values` as attributes.
 * Each value is a color string. Colors will not overlap
 * but remain consistent based on `hashFunction`.
 * @param {Array} values Array to extract colors for.
 * @param {Function} valueAccessor Function to pull out the value from values with.
 *  defaults to identity function.
 * @param {Function} keyAccessor Function to pull out the key from the values.
 *  default to the valueAccessor.
 * @param {Function} hashFunction Function to convert value to an index into color array.
 *  defaults to hashAsn which expects value to be ASN strings.
 * @return {Object} With a key for each value in values.
 */
function colorsFor(colors, values = [], hashFunction, valueAccessor = d => d, keyAccessor) {
  keyAccessor = keyAccessor || valueAccessor;
  const mappedColors = extractColors(colors, values, hashFunction, valueAccessor);
  const colorMap = {};
  mappedColors.forEach((color, index) => {
    colorMap[keyAccessor(values[index])] = color;
  });

  return colorMap;
}













setup();
