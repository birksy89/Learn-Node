const axios = require('axios');

exports.getCollectionDates = async (req, res) => {


    const uprn = req.params.uprn;
    const councilUrl = `https://www.richmondshire.gov.uk/Umbraco/Api/BinRoundInfoApi/GetBinRoundData?uprn=${uprn}`


  axios.get(councilUrl).then(res => {

    const collections = res.data;
    if (!collections.length) {
      console.log("No places found!");
      return;
    }
    else{
        console.log(collections);
        console.log(`There are ${collections.length} items`);

        const nxtCollectionDate = collections[0].start;

        const nxtCollections = collections.filter(collection => collection.start === nxtCollectionDate)

        console.log(`Filtering!!!`);

        console.log(nxtCollections);
        console.log(`There are ${nxtCollections.length} items`);




    }
  });

  res.json({
    Hello: "World",
    uprn: req.params.uprn
  });
};
