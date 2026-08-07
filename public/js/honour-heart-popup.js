document.addEventListener("DOMContentLoaded", async () => {

    try{

        const response = await fetch("/honour-heart/popup");

        const data = await response.json();

        if(!data.id){

            return;

        }

        const popup=document.createElement("div");

        popup.className="hh-popup-overlay";

        popup.innerHTML=`

        <div class="hh-popup">

            <button class="hh-close">

                &times;

            </button>

            <img
            src="/uploads/honour-heart/awardees/${data.photo}">

            <h2>

                ${data.name}

            </h2>

            <h4>

                ${data.designation}

            </h4>

            <p>

                ${data.biography.substring(0,220)}...

            </p>

            <a
            href="/honour-heart"
            class="hh-btn">

                Know More

            </a>

        </div>

        `;

        document.body.appendChild(popup);

        popup.querySelector(".hh-close").onclick=()=>{

            popup.remove();

        };

    }catch(err){

        console.log(err);

    }

});
