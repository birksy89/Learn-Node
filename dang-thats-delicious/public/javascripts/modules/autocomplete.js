function autocomplete(input, latInput, lngInput) {
  if (!input) return; //skip this if not input on the page

  const dropdown = new google.maps.places.Autocomplete(input)

  dropdown.addListener('place_changed', ()=>{
      const place = dropdown.getPlace();
      console.log(place);

      latInput.value = place.geometry.location.lat();
      lngInput.value = place.geometry.location.lng();
  })

  //If someone hits enter on the address field, don't submit the form

  input.on('keydown', (e)=>{
      if(e.keyCode === 13){

      }
  })

  console.log(input, latInput, lngInput);
}

export default autocomplete;
