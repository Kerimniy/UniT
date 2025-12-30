let links = document.getElementById("links-chart");
let search_input = document.getElementById("search_input")
let content = document.getElementById("content")
let search_result = document.getElementById("result")



function toggleArrow() {
    if (links.style.display!="none"){
        links.style.display ="none"
    }
    else{
        links.style.display ="block"
    }

    document.getElementById("arrow").classList.toggle("toggle");
   
}
 function copyEventB(_this,text){
             navigator.clipboard.writeText(text);
             let src_p = _this.firstElementChild.src
             _this.firstElementChild.src = "/static/icons/check.svg"
            setTimeout(()=>{_this.firstElementChild.src = src_p}, 3000) 
    }
let headers = document.querySelectorAll('[data-index]');
if (headers.length<1){
    links.parentElement.remove()
}
for (let e of headers) {
    let a = document.createElement("a");
    a.innerText = e.innerText;
    a.addEventListener("click", () => {
        e.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
    links.appendChild(a);
}

search_input.addEventListener('keyup', function(event) {
  if (event.code=="Enter"){
    fetch(`/-/search?q=${search_input.value}`,{method:"GET"})
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        search_result.innerHTML = ""
        let c = true
        for (key in data){
            
            let el = createElementFromHTML(`<div onclick="this.lastElementChild.click()" class="search-result">
                        <a target="_blank"></a>
                    </div>`
                 )
            if (!c){
                el.style.filter = "brightness(115%)"   
            }
            if (key.includes(".")){
                let temp = key.slice(0,key.length-5)
                el.lastElementChild.innerText = temp
                el.lastElementChild.href = `/p/${data[key].slice(0,key.length-5)}`
            }
            else{
                let temp = `\x01${data[key].split("/").join("/\x01")}/`
                el.lastElementChild.innerText = key+"/"
                el.lastElementChild.href = `/-/index?p=${temp}`
            }
            search_result.appendChild(el)
            c=!c
        }
    })
    
  }
});

document.addEventListener('keydown', function(event) {
  if (event.code=="Slash" || event.code=="NumpadDivide" || event.code == "Backslash" || event.code=="IntlBackslash"){
    search_input.focus()
    
  }
});

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}



fetch(`/-/api/history`,{method:"GET"})
    .then(function(response){
        return response.json();
    })
    .then(function(data){

       for (let i=data.length-1;i>-1;i--){
        let msg = document.createElement("p")
        let time = document.createElement("p")
        msg.innerText = data[i]["message"]
        time.innerText = data[i]["timestamp"]
        msg.style.marginLeft = "2vw"
        time.style.textAlign = "center"
       let grid = document.createElement("div")

        grid.appendChild(msg)
        grid.appendChild(time)
        content.append(grid)
       }
     
    })



const sideMenu = document.getElementById('sideMenu');
const openButton = document.getElementById("openbtn")

function toggleMenu() {
    sideMenu.classList.toggle('open');
}

openButton?.addEventListener('click', (e) => {
    e.stopPropagation();       
    toggleMenu();
});

document.addEventListener('click', (e) => {
    const clickedInsideMenu = sideMenu.contains(e.target);
    const clickedOnOpenButton = openButton?.contains(e.target);

    if (!clickedInsideMenu && !clickedOnOpenButton) {
        sideMenu.classList.remove('open');
    }
});

