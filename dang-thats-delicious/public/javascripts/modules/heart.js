import axios from "axios";
import { $ } from "./bling";

function ajaxHeart(e) {
  e.preventDefault(); //Prevents the traditional form from submiting
  //console.log("Heart IT");

  //console.log(this);

  axios
    .post(this.action)
    .then(res => {
      //console.log(res.data);
      const isHearted = this.heart.classList.toggle("heart__button--hearted");
      //console.log(isHearted);
      //Update Counter
      $('.heart-count').textContent = res.data.hearts.length;

      if(isHearted){
          this.heart.classList.add('heart__button--float')
          setTimeout(()=> this.heart.classList.remove('heart__button--float'), 2500)
      }
    })
    .catch(error => console.log(error));
}

export default ajaxHeart;
