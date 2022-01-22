// Import the fs module
const fs = require('fs');

// Import the request module
const request = require('request');

// Import the prompt module
const prompt = require('prompt-sync')();

// Import the config file
const config = require('./config.json');

// Create a function to generate a random string
function randomString(length) {
    // Create a string with the characters you want to use
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz';

    // Create a variable to hold the string
    var result = '';

    // Create a loop to generate the string
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

    // Return the string
    return result;
}

// Send a request to a webhook
const sendWebhook = (url, message) =>{
    request.post(url, {
        json: {
            content: message
        }
    });
}

// Create a function to create a GET request
function getRequest(url, callback) {

    // Create a variable to hold the options
    var options = {
        url: url,
        headers: {
            'User-Agent': randomString(10)
        }
    };
    

    // Create a variable to hold the request
    var req = request(options, function(error, response, body) {
        // Call the callback function
        callback(error, response, body);
    });

    // Check if console logging is enabled
    if (config.logging.console) {
        // Log the request
        console.log(req.uri.href);
    }

    // Check if webhook logging is enabled
    if (config.logging.webhook.length > 0) {
        // Log the request to the webhook
        sendWebhook(config.logging.webhook, req.uri.href)
    }
    
    // Check if file logging is enabled
    if (config.logging.file){
        // Log the request to scrapedUrls.txt
        fs.appendFile('scrapedUrls.txt', url + '\n', function(err) {
            if (err) throw err;
        });
    }
}

// Get the number of urls to scrape
var numberOfUrls = prompt('How many urls do you want to scrape? ');

// Create a loop to scrape the urls
for (var i = 0; i < numberOfUrls; i++) {
    getRequest(`https://prnt.sc/${randomString(6)}`, function(error, response, body) {
        // Look for https://image.prntscr.com in the body of the response
        if (body.includes('https://image.prntscr.com')) {
            // Create a variable to hold the image URL
            var imageURL = body.match(/https:\/\/image.prntscr.com\/image\/.*/g)[0];

            // Parse the image URL
            imageURL = imageURL.replace(/"\/>.*/g, '');

            // Write the image URL to a file
            request(imageURL).pipe(fs.createWriteStream(`./images/${randomString(6)}.png`));
        }
    });
}