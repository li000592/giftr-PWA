document.addEventListener('DOMContentLoaded', ()=>{
    // Date Picker
    var datepicker = document.querySelectorAll('.datepicker');
    M.Datepicker.init(datepicker);

    //activate sidenav
    // let side = document.querySelectorAll('#sidebar');
    // let sideOpts = {
    //     edge: 'right',
    //     draggable: false
    //   };
    // let instances = M.Sidenav.init(side, sideOpts);
    // let sideMenu = instances[0];

    //modal setup
    let elems = document.querySelectorAll('.modal');
    let modalOpts = {
        dismissible: true,
        startingTop: '10vh',
        inDuration: 350,
        outDuration: 200
    };
    let modal = M.Modal.init(elems, modalOpts);
    modal = modal[0];


    document.querySelector("#nav-mobile").addEventListener("click", ev=>{
        ev.preventDefault();
        console.log(ev)
        let tar = ev.target.text;
        // let whichBtn = tar.getAttribute('data-btn');
        let template;
        // console.log(whichBtn);
        if(tar == "Login"){
            template = document.getElementById('loginFormTemplate');
        }else{
            template = document.getElementById("registerFormTemplate");
        }

        let myModal = document.querySelector("#my-modal");
        myModal.textContent = "";

        let div = template.content.cloneNode(true);
        myModal.appendChild(div);
        // sideMenu.open();
        modal.close();
    })
    document.querySelector("#nav-mobile").addEventListener("click", ev=>{
        console.log("123")
        modal.open();
    })
});