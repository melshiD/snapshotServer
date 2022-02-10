//https://medium.com/@viviancpy/save-screenshot-of-websites-with-puppeteer-cloudinary-and-heroku-1-3-bba6082d21d0
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function doScreenCapture(url, site_name) {

    const d = new Date();
    const current_time = `${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}`
    
    const cloudinary_options = { 
      public_id: `newsshot/${current_time}_${site_name}`,
    };
    console.log(cloudinary_options.public_id);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});  

//   for local file storage
//   await page.screenshot({
//     fullPage: true,
//     path:`./images/${site_name}.png`
//   });

//for cloud storage
let shotResult = await page.screenshot({
    fullPage: false
  }).then((result) => {
    console.log(`${site_name} got some results.`);
    return result;
  }).catch(e => {
    console.error(`[${site_name}] Error in snapshotting site`, e);
    return false;
  });

  // Return cloudinaryPromise if screen
  // capture is successful, or else return null
  if (shotResult){
    return cloudinaryPromise(shotResult, cloudinary_options);
  }else{
    return null;
  }
}

function cloudinaryPromise(shotResult, cloudinary_options){
    return new Promise(function(res, rej){
      cloudinary.v2.uploader.upload_stream(cloudinary_options,
        function (error, cloudinary_result) {
          if (error){
            console.error('Upload to cloudinary failed: ', error);
            rej(error);
          }
          res(cloudinary_result);
        }
      ).end(shotResult);
    });
  }

  

const new_sites = [
    {
      name: 'nasa',
      url: 'https://www.nasa.gov/'
    }, {
      name: 'melshtastic',
      url: 'https://www.melshtastic.com/'
    }, {
      name: 'coindesk',
      url: 'https://www.coindesk.com/'
    }, {
      name: 'cointelegraph',
      url: 'https://cointelegraph.com/'
    }, {
      name: 'reuters_ara',
      url: 'https://ara.reuters.com/'
    }, {
      name: 'crypto',
      url: 'https://coinmarketcap.com/'
    }, {
      name: 'reuters_ara',
      url: 'https://ara.reuters.com/'
    }, {
      name: 'crypto',
      url: 'https://coinmarketcap.com/'
    }
    //how can I limit the size/length what have you of the screenshot taken
  ];

  async function doSnapshots(new_site){
      let cloudinary_promises = [];
      for(let site of new_sites){
          try{
              let cloudinary_snapshot = await doScreenCapture(site['url'], site['name']);
              if(cloudinary_snapshot){
                  cloudinary_promises.push(cloudinary_snapshot);
              }
          } catch(e){
              console.error(`[${site['name'] || 'Unknown site'}] Error insnapshotting`, e);
          }
      }
      Promise.all(cloudinary_promises).then(function(val) {
          process.exit();
      });
  }

  doSnapshots(new_sites);
//  WHEN YOU SIT BACK DOWN, BUILD THIS FOLDER INTO A NEW REPO AND DEPLOY AND CONNECT TO HEROKU