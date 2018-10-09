const axios = require("axios");

function searchResultsHTML(stores) {
  return stores
    .map(store => {
      return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
      `;
    })
    .join("");
}

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
    searchResults.innerHTML = "";

    axios.get(`/api/search?q=${this.value}`).then(res => {
      if (res.data.length) {
        const html = searchResultsHTML(res.data);
        searchResults.innerHTML = html;
      }
    })
    .catch(err => {
      console.log(err);

    });
    console.log(this.value);
  });
}

export default typeAhead;
