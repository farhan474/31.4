const fs = require('fs').promises;
const axios = require('axios');

async function writeOrPrint(content, outputPath) {
  try {
    if (outputPath) {
      await fs.writeFile(outputPath, content);
      console.log(`Content saved to ${outputPath}`);
    } else {
      console.log(content);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: The specified output file '${outputPath}' does not exist.`);
    } else {
      console.error(`Error writing or printing content: ${error.message}`);
    }
  }
}

async function cat(path, outputPath) {
  try {
    const data = await fs.readFile(path, 'utf8');
    await writeOrPrint(data, outputPath);
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
}

async function webCat(url, outputPath) {
  try {
    const response = await axios.get(url);
    const content = response.data;
    await writeOrPrint(content, outputPath);
  } catch (error) {
    console.error(`Error fetching URL: ${error.message}`);
  }
}

async function processInputs(inputs) {
  for (const input of inputs) {
    const parts = input.split('--out');
    let outputPath = null;
    let item = parts[0].trim();
    if (parts.length === 2) {
      outputPath = parts[1].trim();
    }

    if (item.startsWith('http://') || item.startsWith('https://')) {
      await webCat(item, outputPath);
    } else {
      await cat(item, outputPath);
    }
  }
}

async function main() {
  const inputs = process.argv.slice(2);

  if (inputs.length === 0) {
    console.error('Usage: node step3.js [--out output-file] <file_path_or_url>...');
    return;
  }

  await processInputs(inputs);
}

main();
