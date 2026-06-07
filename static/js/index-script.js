

let links = document.getElementById("links-chart");
let search_input = document.getElementById("search_input")



function toggleArrow() {
    if (links.style.display != "none") {
        links.style.display = "none"
    }
    else {
        links.style.display = "block"
    }

    document.getElementById("arrow").classList.toggle("toggle");

}
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

function copyEventB(_this, text) {
    navigator.clipboard.writeText(text);
    let src_p = _this.firstElementChild.src
    _this.firstElementChild.src = "/static/icons/check.svg"
    setTimeout(() => { _this.firstElementChild.src = src_p }, 3000)
}

const content = document.getElementById("content")
const paths_bar = document.getElementById("paths")
let search_result = document.getElementById("result")

let index = {}

const urlParams = new URLSearchParams(window.location.search);
let p = urlParams.get('p');
if (p == undefined) {
    p = ""
}
let paths = []
let path_el = p.split("/")
let s = ""
for (let i = 0; i < path_el.length - 1; i++) {
    s = path_el[i] + "/"
    paths.push(s)
}
let path_link = ""

for (let i = 0; i < paths.length; i++) {
    path_link += paths[i]
    paths_bar.appendChild(createElementFromHTML("<span> / </span>"))
    let child = document.createElement("a")
    child.href = `/-/index?p=${path_link}`
    child.innerText = paths[i].replaceAll("\x01", "").slice(0, -1)
    if (i == paths.length - 1) {
        document.title = `Index • ${paths[i]}`
    }
    paths_bar.appendChild(child)
}
fetch(`/-/api/get-index-pages?p=${p}`, {
    method: "GET",
})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        if (data["status"] == "400") {
            window.location.href = "/-/index"
        }

        createIndex(data)
        createPanels(index)
    })


function createIndex(dict) {

    for (let e in dict) {
        let c = e[0].toUpperCase()

        if (e[0] == "\x01") {
            c = e[1].toUpperCase()
        }

        if (index[c] === undefined) {
            index[c] = {}
        }
        if (Object.keys(dict[e]).length > 0) {
            index[c][e] = dict[e]

        }
        else {
            index[c][e] = ""
        }

    }

}

function createPanels(dict) {
    let grid = document.createElement("div")
    grid.classList.add("index-grid")

    for (let e in dict) {

        let card = createElementFromHTML(`
            <div class="index-card">
                <p>${e}</p>
                <hr>
            </div>`
        )

        for (let e1 in dict[e]) {
            let t = e1[0] === "\x01" ? e1.slice(1) : e1
            let child = document.createElement("a")
            child.innerText = t
            child.href = e1[0] === "\x01" ? `/-/index?p=${p + e1}` : `/${p.split("/").map(str => str.replaceAll("\x01", "")).join("/") + e1}`
            card.appendChild(child)
        }

        grid.appendChild(card)
    }

    content.appendChild(grid)
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}


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

document.addEventListener('keydown', function (event) {
    if (event.code == "Slash" || event.code == "NumpadDivide" || event.code == "Backslash" || event.code == "IntlBackslash") {
        search_input.focus()

    }
});

