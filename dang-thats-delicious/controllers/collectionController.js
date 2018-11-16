const axios = require("axios");
const mail = require("../handlers/mail");


//Trialing out schedule work
//This will call the function every 42 seconds!
var schedule = require('node-schedule');
var j = schedule.scheduleJob('42 * * * * *', function(){
  module.exports.getCollectionDates({params:{uprn: 10012784380}});
});



exports.getCollectionDates = async (req, res) => {

  console.log("Getting Collection Dates!");

  const uprn = req.params.uprn;
  const councilUrl = `https://www.richmondshire.gov.uk/Umbraco/Api/BinRoundInfoApi/GetBinRoundData?uprn=${uprn}`;

  axios
    .get(councilUrl)
    .then(res => {
      const collections = res.data;
      if (!collections.length) {
        console.log("No places found!");
        return;
      } else {
        //console.log(collections);
        console.log(`There are ${collections.length} items`);

        const nxtCollectionDate = collections[0].start;

        const nxtCollections = collections.filter(
          collection => collection.start === nxtCollectionDate
        );

        console.log(`Filtering!!!`);

        //console.log(nxtCollections);
        console.log(`There are ${nxtCollections.length} items`);
        return nxtCollections;
      }
    })
    .then( async collections => {
      console.log("Data Version");

      console.log(collections);

      // Send an email to the user
      await mail.sendToEmail({
        email: "james@purplecs.com",
        subject: "Recycling",
        collections
      });

      if(res){
        res.json({
          Hello: "World",
          uprn: req.params.uprn
        });
      }
      else{
        console.log(collections);

      }


    });
};
