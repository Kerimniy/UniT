let links = document.getElementById("links-chart");

let search_input = document.getElementById("search_input")

let search_result = document.getElementById("result")

let right = document.getElementById("right")

let open_image = document.getElementById("open-image")

open_image.lastElementChild.addEventListener("click", () => {
    open_image.classList.add("hide")
})

let images = document.querySelectorAll('img[data-att]')
for (let image of images) {
    image.addEventListener("click", () => {
        open_image.classList.remove("hide")
        let url = image.src
        open_image.firstElementChild.style.backgroundImage = `url(${url})`
    })
}


function toggleArrow() {
    if (links.style.display != "none") {
        links.style.display = "none"
    }
    else {
        links.style.display = "block"
    }

    document.getElementById("arrow").classList.toggle("toggle");

}


let headers = document.querySelectorAll('[data-index]');

let ranges = []
let i = 0

for (let e of headers) {



    if (i == 0) {
        ranges.push(0)
    }
    else {
        ranges.push(e.offsetTop)
    }

    let a = document.createElement("a");
    a.innerText = e.innerText;
    a.addEventListener("click", () => {
        e.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', '#' + e.id);

    });
    if (e.tagName.length == 2 && e.tagName[0] == "H") {
        a.style.marginLeft = `${Number(e.tagName[1]) * 10}px`
    }
    links.appendChild(a);

    i++
}

try {

    ranges.push(right.scrollHeight)
    if (i < 1) {
        links.parentElement.remove()
    }

}
catch (error) {

}

right.addEventListener("scroll", (e) => {
    highlightIndex()
})
highlightIndex()

function highlightIndex() {
    let s = right.scrollTop + right.offsetTop * 2

    for (let t = 0; t < ranges.length - 1; t++) {
        if (ranges[t] <= s && s < ranges[t + 1]) {

            for (let f = 0; f < links.children.length; f++) {
                if (f == t) {
                    continue
                }
                links.children[f].style.fontWeight = ""
            }
            links.children[t].style.fontWeight = "700"



        }
    }
}

try {

    search_input.addEventListener('keyup', function (event) {
        if (event.code == "Enter") {
            fetch(`/-/search?q=${search_input.value}`, { method: "GET" })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    search_result.innerHTML = ""
                    let c = true
                    for (key in data) {

                        let el = createElementFromHTML(`<div onclick="this.lastElementChild.click()" class="search-result">
                            <a target="_blank"></a>
                        </div>`
                        )
                        if (!c) {
                            el.style.filter = "brightness(115%)"
                        }
                        if (key.includes(".")) {
                            let temp = key.slice(0, key.length - 5)
                            el.lastElementChild.innerText = temp
                            el.lastElementChild.href = `/p/${data[key].slice(0, key.length - 5)}`
                        }
                        else {
                            let temp = `\x01${data[key].split("/").join("/\x01")}/`
                            el.lastElementChild.innerText = key + "/"
                            el.lastElementChild.href = `/-/index?p=${temp}`
                        }
                        search_result.appendChild(el)
                        c = !c
                    }
                })

        }
    });

}
catch (error) {

}

document.addEventListener('keydown', function (event) {
    if (document.getElementById("rename") == undefined && (event.code == "Slash" || event.code == "NumpadDivide" || event.code == "Backslash" || event.code == "IntlBackslash")) {
        search_input.focus()

    }
});

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

const sideMenu = document.getElementById('sideMenu');
const openButton = document.getElementById("openbtn")

function toggleMenu() {
    sideMenu.classList.toggle('open');
}

openButton.addEventListener('click', (e) => {
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

const delete_url = `/-/delete-page?p=${window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '')}`

function deletePage() {
    fetch(delete_url, { method: "GET" }).then((res) => {
        if (res.ok) {
            window.location.href = "/"
        }
    })
}




function sureTmpl(h) {
    let div = createElementFromHTML(`
        <div class="modal-overlay">
            <div class="modal-content">
                <h2 class="modal-title">Are you sure?</h2>
                <div class="modal-buttons">
                    <button class="modal-button yes">Yes</button>
                    <button class="modal-button no">No</button>
                </div>
            </div>

            <div style="z-index: -1; background-color: #0b0b0b83; width: 100%; height: 100%; position: absolute;"></div>
        </div>`
    )

    div.querySelector(".yes").addEventListener("click", () => {
        h()
        div.remove()
    })

    div.querySelector(".no").addEventListener("click", () => {
        div.remove()
    })
    div.lastElementChild.addEventListener("click", (e) => {
        div.remove()
    })
    document.body.appendChild(div)
}
function copyEvent(_this) {
    navigator.clipboard.writeText(_this.dataset.text);
    _this.classList.toggle("copied")
    setTimeout(() => { _this.classList.toggle("copied") }, 3000)
}

function copyEventB(_this, text) {
    navigator.clipboard.writeText(text);
    let src_p = _this.firstElementChild.src
    _this.firstElementChild.src = "/static/icons/check.svg"
    setTimeout(() => { _this.firstElementChild.src = src_p }, 3000)
}


function renameTmpl() {
    let div = createElementFromHTML(`
        <div id="rename" class="modal-overlay">
            <div class="modal-content">
                <h2 class="modal-title">Rename</h2>
                <input type="text">
                <div class="modal-buttons">
                    <button class="modal-button yes">Save</button>
                    <button class="modal-button no">Cancel</button>
                </div>
            </div>

            <div style="z-index: -1; background-color: #0b0b0b83; width: 100%; height: 100%; position: absolute;"></div>
        </div>`
    )

    div.querySelector(".yes").addEventListener("click", () => {
        div.remove()
        let v = div.querySelector("input").value
        let data = {
            "n": v,
            "p": decodeURI(window.location.pathname)
        }
        console.log(data)
        fetch("/-/api/rename", { method: "POST", body: JSON.stringify(data) }).then((response) => {
            if (!response.ok) {
                console.error(response.statusText)
            }
            else {
                window.location.href = `/${v}`
            }
        })
    })

    div.querySelector(".no").addEventListener("click", () => {
        div.remove()
    })
    div.lastElementChild.addEventListener("click", (e) => {
        div.remove()
    })
    document.body.appendChild(div)
}
Prism.highlightAll();