const axios = require("axios");

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function() {
    //If there is no value, quit it
    if (!this.value) {
      searchResults.style.display = "none";
      return; //stop
    }

    searchResults.style.display = "block";

    axios.get(`/api/search?q=${this.value}`).then(res => {
      console.log(res.data);
    });
    console.log(this.value);
  });
}

export default typeAhead;
