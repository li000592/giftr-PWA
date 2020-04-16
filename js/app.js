const path = {
  "register": "/auth/users",
  "tokens": "/auth/tokens",
  "people": "/api/people",
  "gifts": "/gifts/"
}
const app = {
  registerArr: [],
  page: null,
  SW: null,
  deferredPrompt: null,
  max: 10,
  data:[],
  modal: null,
  login: false,
  tokensKey: "彳亍",
  personKey: "kk",
  tokens: null,
  req: null,
  url: "https://giftr.mad9124.rocks",
  init: () => {
        if ('serviceWorker' in navigator) {

      app.initServiceWorker().catch(console.error);
      // document.getElementById('randImg').addEventListener('click', app.setImg);
    }
    //get the starting value
    let isOnline = 'onLine' in navigator && navigator.onLine;

    window.addEventListener(
      'online',
      function online() {
        M.toast({html: 'ONLINE NOW'})
        // document.body.classList.add('hidden');
        isOnline = true;
      },
      false
    );
    window.addEventListener(
      'offline',
      function offline() {
        M.toast({html: 'NO INTERNET NOW'})
        document.body.classList.remove('hidden');
        isOnline = false;
      },
      false
    );
    let main = document.querySelector("main");

    let page = document.querySelector("title").textContent;

    if(page == "Giftr"){
      app.page = "index";
      // main.textContent = "";
      console.log("INDEX PAGE NOW"); 
      if(app.tokens){
        app.login = true;
        app.getPeople();
        document.getElementById("register").classList.add("hidden");
        document.getElementById("login").classList.add("hidden");
        let logOut= document.getElementById("logOut");
        logOut.classList.remove("hidden");
      }
    }else if ( page == "Giftr-gifts"){
      app.page = "gifts";
      console.log("GIFTS PAGE NOW") 
      app.getGifts();
      app.addEventListener();
      app.modalSetup();
      
    }


    
    if(app.login == false){
      if(page == "Giftr"){
      let template = document.getElementById("noInfoTemplate");
      let div = template.content.cloneNode(true);
      let main = document.querySelector("main");
      main.appendChild(div);
        
    }else{
      console.log("HIdenn login")
      if(page == "Giftr-gifts"){return}
      
      document.getElementById("register1").classList.add("hidden");
      document.getElementById("login").classList.add("hidden");
      let logOut= document.getElementById("logOut");
      logOut.classList.remove("hidden");
      
      // logOut.addEventListener("click", app,logOut);

    }

    
  }
  app.modalSetup();
  app.addEventListener();
  },
  getGifts:()=>{

    let personId = sessionStorage.getItem(app.personKey)
    token = sessionStorage.getItem(app.tokensKey);
    console.log(token)
    let method = "GET";
    let url = app.url + path.people + "/" + personId;
    console.log(url)
    if(token){
    app.tokens = true;
    }
    let personData;
    fetch(app.apiMiddleware(url, method))
    .then(resp => resp.json())
    .then(data=>{
      console.log(data)
      personData = data.data
      console.log(personData)
    })
    .then(()=>{
      let main = document.querySelector("main")
      main.textContent = "";
      let giftsData = personData.gifts;
      console.log(giftsData)

      let cardList = document.createElement("ul");
      let h5= document.createElement("h5");
      h5.setAttribute("class", "center");
      h5.setAttribute("person-Id", personData._id)
      let personName = document.createElement("span");
      personName.setAttribute("class", "personName green-text text-lighten-2");
      personName.textContent = personData.name;
      let title = document.createElement("span");
      title.textContent ="'s Wish List";
      h5.appendChild(personName);
      h5.appendChild(title)
      main.appendChild(h5)


      if(giftsData .length == 0){
        console.log("Your list is empty now. It's time to add some gifts!")
        let p = document.createElement("p");
        p.textContent ="Your list is empty now. It's time to add some gifts!!"
        main.appendChild(p)
      }
      else{

        cardList.setAttribute("class", "card-list");
        main.appendChild(cardList);
        giftsData .forEach((element,index) => {
          let template = document.getElementById('cardTemplate');
          let div = template.content.cloneNode(true);
          cardList.appendChild(div);

          //because API only allows the number higher than 100, I wanna users can input the price minimum is $0.01;
          let price = element.price / 10000;

          document.querySelectorAll(".goodsName")[index].textContent = element.name;
          document.querySelectorAll(".priceNum")[index].textContent = price;
          
          document.querySelectorAll(".storeName")[index].textContent = element.store.name;
          let webLink = document.querySelectorAll(".webLink")[index];
          webLink.textContent = element.store.productUrl;
          webLink.href = "https://" + element.store.productUrl;
          let deleteBtn = document.querySelectorAll(".del-gifts")[index];
          console.log("giftIDDDD:",element._id)
          deleteBtn.setAttribute("gifts-id", element._id);
          deleteBtn.addEventListener("click", app.deleteGifts);

        });
      }

      document.getElementById("loading").classList.add("hidden");
    })
    .catch(console.error)

  },
  deleteGifts:ev=>{
    ev.preventDefault();
    let tar =ev.target;
    let id = tar.getAttribute("gifts-id");
    let personID = document.querySelector("h5").getAttribute("person-id")
    method = "DELETE";
    let url = app.url + path.people + "/" + personID + path.gifts + id;

    console.log(personID)
    fetch(app.apiMiddleware(url, method))
    .then(resp=>{
      console.log(resp);
      M.toast({html: 'Delete this gift success!'});
      document.getElementById("loading").classList.add("hidden");
      app.getGifts();

    })
    .catch(console.error)
  },
  logOut:()=>{
    M.toast({html: 'logOut success!'});
    app.tokens = null;
    app.login = false;
    sessionStorage.setItem(app.tokensKey, "NOT IN LOG");
    app.getPeople();
    document.getElementById("register").classList.remove("hidden");
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("logOut").classList.add("hidden");
    document.querySelector("main").textContent = "";
    
  },
  addEventListener:()=>{
    if(app.page == "index"){
      document.querySelector("#nav-mobile").addEventListener("click", app.LoginForm);
      document.querySelector("#fab").addEventListener("click", app.fab);
    }else{

    document.querySelector("#fab-gift").addEventListener("click", app.fabGift);
  }
    
  },
  modalSetup:()=>{
    let elems = document.querySelectorAll('.modal');
    let modalOpts = {
        dismissible: true,
        startingTop: '10vh',
        inDuration: 350,
        outDuration: 200
    };
    app.modal = M.Modal.init(elems, modalOpts);
    app.modal = app.modal[0];
  },
  datePickerSetup:()=>{
        //set up date picker
        let dateOpts = { format: 'yyyy-mm-dd' };
        let dates = document.querySelectorAll('.datepicker');
        app.dateInsts = M.Datepicker.init(dates, dateOpts);
        
  },
  LoginForm : ev=>{
    ev.preventDefault();
    console.log(ev)
    let tar = ev.target.text;
    if(tar == undefined){
      tar = ev.target.innerText;
      console.log("TAR",tar)
    }
    let template;
    console.log(tar)
    if(tar == "logOut"){
      app.logOut();
      return
    }
    if(tar == "Login"){
        template = document.getElementById('loginFormTemplate');
    }else if(tar =="Register" || tar =="Sign Up"){
        template = document.getElementById("registerFormTemplate");
    }

    let myModal = document.querySelector("#my-modal");
    myModal.textContent = "";

    let div = template.content.cloneNode(true);
    myModal.appendChild(div);
    // sideMenu.open();
    app.modal.open();

    document.getElementById("cancel-btn").addEventListener("click", ()=>{
      app.modal.close();
    })
    if(tar == "Login"){
      document.getElementById("login-btn").addEventListener("click", app.goLogin);
      document.querySelector(".sub-signup-btn").addEventListener("click", ev=>{
        console.log(ev)
        app.modal.close();
        app.LoginForm(ev);
      })
    }else{ 
      document.getElementById("register-btn").addEventListener("click", app.register);
      document.querySelector(".sub-login-btn").addEventListener("click", ev=>{
        console.log(ev)
        app.modal.close();
        app.LoginForm(ev);
      })
      // document.getElementById("subLogin").addEventListener("click", ()=>)
    }
    


  },
  register:()=>{
    document.getElementById("loading").classList.remove("hidden");
    let email =document.getElementById("email-input").value;
    let password =document.getElementById("password-input").value;

    if(email !== "" &&  password !== ""){

      let url = app.url + path.register;

      let data = {
        firstName: "HoWing",
        lastName: "Lee",
        email: email,
        password: password
      };
      let body = JSON.stringify(data)
      let method = "POST";

      fetch(app.apiMiddleware(url, method, body))
        .then(resp => {
          console.log(resp);
          if (resp.status >= 500) {
            throw Error('Server Error')
          } else if (resp.status >= 400) {
            throw Error('User Error')
          } else {
            return resp.json();
          }
        })
        .then(data => { 
          M.toast({html: 'registration success!'});
          document.getElementById("loading").classList.add("hidden");    
          app.goLogin(email, password);
          app.modal.close();
        })
        .catch((error) => {
          console.error(error)
          document.getElementById("loading").classList.add("hidden");
          app.modal.close();
          if (error.message == 'Server Error') {
            M.toast({html: 'Server failed'})  
          } else {
            M.toast({html: 'registration failed'})
          }
        });

        
    }else{
        M.toast({html: 'Fill up all the information!'});
    }  
  },
  apiMiddleware:(url, method, body)=>{
    document.getElementById("loading").classList.remove("hidden");
    console.log(url, method, body)
    let headers = new Headers();  
    if(app.tokens){
      let token = JSON.parse(sessionStorage.getItem(app.tokensKey));
      headers.append('Authorization', `Bearer ${token}`);
    }
    if(method !== "GET" && method !== "DELETE"){
    headers.append('Content-Type', 'application/json');
    }
    
    let opt = {
      method: method,
      mode: 'cors',
      headers: headers
    }
    if(body){
      opt.body = body
    }
    return req = new Request(url, opt);
  },
 getPeople:(data)=>{
   
    app.token = sessionStorage.getItem(app.tokensKey);
    let peopleData;
    let method = "GET";
    let url = app.url + path.people;

    fetch(app.apiMiddleware(url, method))
    // .then(console.log)
    .then(resp => resp.json())
    .then(data=>{
      console.log("DATA", data.data);
      peopleData = data.data;

      let main = document.querySelector("main")
      main.textContent = "";
      if(peopleData.length == 0){
        console.log("Your list is empty now. It's time to add your folks!")
        main.textContent = "Your list is empty now. It's time to add your folks!"
      }
      else{
        let cardList = document.createElement("ul");
        cardList.setAttribute("class", "card-list collection");
        main.appendChild(cardList);
        peopleData.forEach((element,index) => {

          let template = document.getElementById('cardTemplate');
          let div = template.content.cloneNode(true);
          cardList.appendChild(div);

          let time = new Date( element.birthDate)
          let formatted = new Intl.DateTimeFormat('en-US').format(time);
          document.querySelectorAll(".birthday")[index].textContent = formatted;
          document.querySelectorAll(".person-name")[index].textContent = element.name;
          let deleteBtn = document.querySelectorAll(".del-person")[index];
          let giftBtn = document.querySelectorAll(".gift-btn")[index];
          deleteBtn.setAttribute("delete-id", element._id);
          giftBtn.setAttribute("person-id", element._id);
          
          deleteBtn.addEventListener("click", app.deletePerson);
          giftBtn.addEventListener("click", app.goGifts);
          document.getElementById("loading").classList.add("hidden");
        });
    }
    })
    .catch(console.error)
      
    // let main = document.querySelector("main")
    // let cardList = document.createElement("ul");
    // cardList.setAttribute("class", "card-list collection");
    // app.data.forEach(element,index => {

    //   let template = document.getElementById('cardTemplate');
    //   let div = template.content.cloneNode(true);
    //   cardList.appendChild(div);

    // });
  },
  goLogin:(email, password)=>{
    // let email;
    // let password;
    
    if(document.getElementById("email-input").value){
      email = document.getElementById("email-input").value;
      password = document.getElementById("password-input").value;
    }
    console.log(email, password)
    if(email !== "" &&  password !== ""){
      let url = app.url + path.tokens;
      let data = {
        email: email,
        password: password
      };
      let method = "POST";
      let body = JSON.stringify(data)

      fetch(app.apiMiddleware(url, method, body))
      .then(resp => {
        console.log(resp);
        if (resp.status >= 500) {
          throw Error('Server Error')
        } else if (resp.status >= 400) {
          throw Error('User Error')
        } else{
          return resp.json()
        }
      })
      .then(data => {
        console.log(data)
        let token = JSON.stringify(data.data.token);
        console.log(token);
        sessionStorage.setItem(app.tokensKey, token);
        app.tokens = true;
        app.login = true;
        app.getPeople();
        document.getElementById("register").classList.add("hidden");
        document.getElementById("login").classList.add("hidden");
        let logOut= document.getElementById("logOut");
        logOut.classList.remove("hidden");
        document.getElementById("loading").classList.add("hidden");
      })
      .then(data => { 
        M.toast({html: 'Login success!'});
        app.modal.close();
      })

      .catch((error) => {
        console.error(error)
        document.getElementById("loading").classList.add("hidden")
        if (error.message == 'Server Error') {
          M.toast({html: 'Server failed'})  
        } else {
          M.toast({html: 'Login failed'})
        }
      });
      }else{
          M.toast({html: 'Fill up all the information!'});
      }  
  },
  fab:ev=>{
    ev.preventDefault();
    console.log(ev)
    if(app.login == false){
      M.toast({html: 'You need login first!'})
    }else{

      let template = document.getElementById("addPersonTemplate");
      let myModal = document.querySelector("#my-modal");
        myModal.textContent = "";
        let div = template.content.cloneNode(true);
        myModal.appendChild(div);
        app.modal.open();
        document.getElementById("cancel-btn").addEventListener("click", ()=>{
          app.modal.close();
        })
        document.getElementById("addPerson-btn").addEventListener("click", app.addPerson)
        app.datePickerSetup();
    }
  },
  addPerson:()=>{
    let name = document.getElementById("name-input").value;
    let date = document.getElementById("birthday-input").value;
    let data = {
      name: name,
      birthDate: date
    }
    let body = JSON.stringify(data);
    let method = "POST";
    let url = app.url + path.people;
    fetch(app.apiMiddleware(url, method, body))
    .then(resp => {
      console.log(resp);
      if (resp.status >= 500) {
        throw Error('Server Error')
      } else if (resp.status >= 400) {
        throw Error('User Error')
      } else {
        return resp.json();
      }
    })
    .then(()=>{
      app.getPeople();
      app.modal.close();
      M.toast({html: 'Add pesron success!'});
      document.getElementById("loading").classList.add("hidden");
    })
    .catch((err)=>{
      console.error(err)
      document.getElementById("loading").classList.add("hidden");
      if (error.message == 'Server Error') {
        M.toast({html: 'Server failed'})  
      } else {
        M.toast({html: 'Add pesron failed'})
      }
    })
  
  },
  deletePerson: ev=>{
    let tar = ev.target;
    console.log(tar);
    let id = tar.getAttribute("delete-id")
    console.log(id)
    let url = app.url + path.people + "/" + id;
    let method = "DELETE";
    
    fetch(app.apiMiddleware(url, method))
    .then(resp=>{
      console.log(resp);
      M.toast({html: 'Delete pesron success!'});  
      app.getPeople();
      document.getElementById("loading").classList.add("hidden");

    })
    .catch(console.error)
  },
  goGifts: ev=>{
    let tar = ev.currentTarget;
    console.log(tar);
    let str = tar
    let id = str.getAttribute("person-id")
    JSON.parse(sessionStorage.setItem(app.personKey, id));   
  },
  initServiceWorker: async () => {
    let swRegistration = await navigator.serviceWorker.register('../sw.js', {
      updateViaCache: 'none',
      scope: '/',
    });
    app.SW =
      swRegistration.installing ||
      swRegistration.waiting ||
      swRegistration.active;
    //the registration object could be in any state

    // listen for new service worker to take over
    //could be first one or a new one taking over
    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      app.SW = navigator.serviceWorker.controller;
    });
    navigator.serviceWorker.addEventListener('message', app.onMessage, false);
  },
  fabGift:ev=>{
    ev.preventDefault();
    let template = document.getElementById("addGiftsTemplate");
    let myModal = document.querySelector("#my-modal");
      myModal.textContent = "";
      let div = template.content.cloneNode(true);
      myModal.appendChild(div);
      app.modal.open();
      document.getElementById("cancel-btn").addEventListener("click", ()=>{
        app.modal.close();
      })
      document.getElementById("addGifts-btn").addEventListener("click", app.addGift)
      app.datePickerSetup();
  },
  addGift:()=>{
    let gift = document.getElementById("gift-input").value;
    let price = document.getElementById("price-input").value;
    let store = document.getElementById("store-input").value;
    let website = document.getElementById("website-input").value;
    
    // because API only allows the number higher than 100, I wanna users can input the price minimum is $0.01;
    price = price * 10000;

    let gifts = {
      "name": gift,
      "price": price,
      "store": {
        "name": store,
        "productUrl": website
      }
    }
    let body = JSON.stringify(gifts);
    let method = "POST";
    let personID = document.querySelector("h5").getAttribute("person-id")
    let url = app.url + path.people + "/" + personID +path.gifts

    fetch(app.apiMiddleware(url, method, body))
    .then(resp => {
      console.log(resp);
      if (resp.status >= 500) {
        throw Error('Server Error')
      } else if (resp.status >= 400) {
        throw Error('User Error')
      } else {
        return resp.json();
      }
    })
    .then(()=>{
      app.getGifts();
      app.modal.close();
      M.toast({html: 'Add gift success!'});
      document.getElementById("loading").classList.add("hidden");
    })
    .catch((err)=>{
      console.error(err)
      document.getElementById("loading").classList.add("hidden");
      if (error.message == 'Server Error') {
        M.toast({html: 'Server failed'})  
      } else {
        M.toast({html: 'Add gift failed'})
      }
    })
  },
  onMessage: (ev) => {
    //message from SW received
    let { data } = ev;
    console.log("onMessage", ev.ports);
    console.log("onMessage", data);
  },
  sendMessage: (msg) => {
    app.SW.postMessage(msg);
  },
  setImg: () => {
    let rand = Math.floor(Math.random() * 20) + 100;
    let url = `https://picsum.photos/id/${rand}/300/300`;
    let img = document.getElementById('randImg');
    img.addEventListener('error', (err) => {
      //error loading image
      //try again
      if (app.max > 0) {
        app.setImg();
      }
    });
    img.addEventListener('load', (ev) => {
      //img has loaded...
      //reset our max attempts to 10
      app.max = 10;
    });
    app.max--;
    img.src = url;
  },
};
document.addEventListener('DOMContentLoaded', app.init);
