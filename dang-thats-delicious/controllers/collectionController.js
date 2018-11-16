const axios = require("axios");
const mail = require("../handlers/mail");

exports.getCollectionDates = async (req, res) => {
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

      res.json({
        Hello: "World",
        uprn: req.params.uprn
      });
    });
};
