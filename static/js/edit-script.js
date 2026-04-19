const togglePreview = document.getElementById("toggle-preview")


const preview =document.getElementById("preview")

const editor = CodeMirror(document.getElementById("editor"), {
            theme: "monokai",
            lineNumbers: true,
            lineWrapping: false,
            styleActiveLine: true,
            autofocus: true,
            smartIndent: false,
            electricChars: false,
            extraKeys: {
                "Ctrl-Shift-F": function(cm) { searchInput.focus(); },
                "Shift-Ctrl-Down": function(d){ editor.execCommand("duplicateLine")},
    "Shift-Ctrl-Up": "moveLineUp"
  
            },
            mode: "htmlmixed"
});


togglePreview.addEventListener("click", ()=>{
    if (togglePreview.innerText === "Preview"){
        togglePreview.innerHTML = "Code"

        document.getElementById("container").style.display="none"
        preview.style.display="block"
        updatePreview()
    }
    else{
        togglePreview.innerHTML = "Preview"    
        document.getElementById("container").style.display="flex"
        preview.style.display="none"    
    }
})



document.addEventListener("keydown", (e) => {
  if (!e.shiftKey || !e.altKey) return;

  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

  if (!editor.hasFocus()) return;

  e.preventDefault();
  e.stopPropagation();

  if (e.key === "ArrowDown") {
    console.log("t")
    editor.execCommand("duplicateLine");
  }

  if (e.key === "ArrowUp") {
    editor.execCommand("duplicateLine");
    editor.execCommand("goLineUp");
  }
});
        editor.focus();

        const searchInput  = document.getElementById('search');
        const replaceInput = document.getElementById('replace');
        const replaceAllBtn = document.getElementById('replaceAll');
        const replaceOneBtn = document.getElementById('replaceOne');

        const filename = document.getElementById('filename');
        const commit = document.getElementById('commit');
       // const title = document.getElementById('title');

        const urlParams = new URLSearchParams(window.location.search);

        const type = urlParams.get("type");
        let path = urlParams.get("path");

        if (path === undefined || path === "" || path===" "){
            path = "main"
        }

        filename.addEventListener("change",(e)=>{
            let currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('path', filename.value); 
        history.pushState({}, '', currentUrl);


        })

        filename.value = path;
        if (type=="a"){
            //title.innerText = "Create new article";
            
            document.title = "Create new article"
        }
        else {
            //title.innerText = "Edit article";
            
        }


        searchInput.addEventListener('input', () => {
            const needle = searchInput.value;
            if (!needle) {
                return;
            }
            var pos = editor.getCursor("from");
            var cursor = editor.getSearchCursor(needle, pos, {caseFold: true});
            if (cursor.findNext()) {
                editor.setSelection(cursor.from(), cursor.to());
            } else {
                cursor = editor.getSearchCursor(needle, {line: 0, ch: 0}, {caseFold: true});
                if (cursor.findNext()) {
                    editor.setSelection(cursor.from(), cursor.to());
                }
            }
        });

        searchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const needle = searchInput.value;
                if (!needle) return;
                var pos = editor.getCursor("to");
                var cursor = editor.getSearchCursor(needle, pos, {caseFold: true});
                if (cursor.findNext()) {
                    editor.setSelection(cursor.from(), cursor.to());
                } else {
                    cursor = editor.getSearchCursor(needle, {line: 0, ch: 0}, {caseFold: true});
                    if (cursor.findNext()) {
                        editor.setSelection(cursor.from(), cursor.to());
                    }
                }
            }
        });

         replaceOneBtn.addEventListener('click', () => {
            const search  = searchInput.value;
            const replace = replaceInput.value;

            if (!search) {
                return;
            }

            var selected = editor.getSelection();
            if (selected.toLowerCase() === search.toLowerCase()) {
                editor.replaceSelection(replace);
            }

            var pos = editor.getCursor("to");
            var cursor = editor.getSearchCursor(search, pos, {caseFold: true});
            if (cursor.findNext()) {
                editor.setSelection(cursor.from(), cursor.to());
            } else {
                cursor = editor.getSearchCursor(search, {line: 0, ch: 0}, {caseFold: true});
                if (cursor.findNext()) {
                    editor.setSelection(cursor.from(), cursor.to());
                }
            }
            
        });

        replaceAllBtn.addEventListener('click', () => {
            const search  = searchInput.value;
            const replace = replaceInput.value;

            if (!search) {
                return;
            }

            editor.operation(function() {
                var cursor = editor.getSearchCursor(search, {line: 0, ch: 0}, {caseFold: true});
                while (cursor.findNext()) {
                    cursor.replace(replace);
                }
            });
            
        });

        /*
        let raf;
        let t = performance.now()
        editor.on("change", () => {
    
            if (performance.now()-t>75){
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(updatePreview);
                t = performance.now()
            }

          
        })
        */
        
        marked.setOptions({ mangle: false, headerIds: false });

const CALLOUTS = {
    NOTE:       { cls: "note",       title: "Note" },
    WARNING:    { cls: "warn",       title: "Warning" },
    TIP:        { cls: "tip",        title: "Tip" },
    IMPORTANT:  { cls: "important",  title: "Important" },
    CAUTION:    { cls: "caution",    title: "Caution" }
}
const cLikeLanguages = {
    "c":"",
    "c++":"",
    "objective-c":"",

    "java":"",
    "c#":"",
    "kotlin":"",
    "scala":"",


    "javaScript":"",
    "typeScript":"",

    "d":"",
 
    "swift":"",
 
    "cuda":"",
    "opencl":"",
    "opengl":"",
    "glsl":""
  
};


        function updatePreview() {
           const text = editor.getValue().replace(/\n{3,}/g, '\n\n');

            const temp = document.createElement("div");
            temp.innerHTML = marked.parse(text);

            const notes = temp.querySelectorAll('div[data-callout]')
            const index = temp.querySelectorAll('*[data-index]')
            const codes = temp.querySelectorAll('code')
            const tables = temp.querySelectorAll('table')

            const images = temp.querySelectorAll('img')

            let j=0
            for (const image of images){
                
                image.dataset.att=`${j}`
                image.addEventListener("click",()=>{
                    open_image.classList.remove("hide")
                    let url=image.src
                    open_image.firstElementChild.style.backgroundImage=`url(${url})`
                })
                j++
            }


            const blockquotes = temp.querySelectorAll('blockquote');
            for (const table of tables) {
                const wrapper = document.createElement("div");
                wrapper.style.overflowX = "auto";
                wrapper.style.minWidth = "0";
                table.replaceWith(wrapper);
                wrapper.appendChild(table);
            }
            
         
            for(let el of index){
                el.id = el.innerText
                let link_a = document.createElement("a")
                link_a.style.marginLeft = "5px"
                link_a.style.opacity = "0"
                link_a.href = "#"+el.id
                let img = document.createElement("img")
                img.src = "/static/icons/link.svg"
                link_a.appendChild(img)
                el.setAttribute('onmouseenter', "this.firstElementChild.style.opacity = `1`");
                el.setAttribute('onmouseleave', "this.firstElementChild.style.opacity = `0`");
                el.appendChild(link_a)
            }


          for (const el of blockquotes) {
            let p = el.querySelector("p")
            if (!p) continue

            const match = p.textContent.match(/^\[\!(\w+)\]/)
            if (!match) continue
            const type = CALLOUTS[match[1]]
            if (!type) continue
            
            p.innerHTML= p.innerHTML.replace(match[0],"")
            p.style.margin = "auto"
            el.classList.add("callout", type.cls)
            el.style.whiteSpace = "pre-wrap"

            const title = document.createElement("div")
            title.className = `callout ${type.cls}-title`
            title.textContent = type.title

            el.prepend(title)
            
        }



            for (el of codes){
               let className = el.className.replace("language-","",1)
               if (className==""){
                el.classList.add("inline")
                continue
               }
               if (cLikeLanguages[className.toLowerCase()]!==undefined){
                console.log()
                el.className = "language-clike"
                el.parentElement.className = "language-clike"
               }
                let parentNode = el.parentElement.parentElement
               let el_copy = el.parentElement

               let next = el.parentElement.nextElementSibling
               el.parentElement.remove()

               let content = el.innerHTML
               let content1 = el.innerText
               let lines = content.split(/\r\n|\r|\n/)
               let title = document.createElement("div")
               title.classList.add("code-title")
               let copyButton = document.createElement("div")
               copyButton.classList.add("code-copy-button")
               copyButton.appendChild(createElementFromHTML(`<img src="/static/icons/copy.svg">`))
               copyButton.dataset.text = content1
               
               copyButton.setAttribute("onclick", "copyEvent(this)")
           
               let titleText = document.createElement("h4")
               titleText.style.marginTop = "0.3vh"
               titleText.style.marginBottom = "0.3vh"
               let code_block = document.createElement("div")
               code_block.style.display = "inline"

                titleText.innerText = className
               title.appendChild(titleText)
               title.appendChild(copyButton)

               code_block.appendChild(title)
               code_block.appendChild(el_copy)

               if (parentNode.children.length==0){
                    parentNode.appendChild(code_block)
               }
               else{
                parentNode.insertBefore(code_block,next)
               }

               
               
            }


            for (el of notes){
                let type = el.getAttribute('data-callout').toUpperCase()
                el.style.whiteSpace = "pre"
                let content = el.innerHTML
                el.innerHTML = ""

                if (CALLOUTS[type]){
                    el.classList.add("callout", CALLOUTS[type].cls)
                    let title = document.createElement("div")
                    title.classList.add("callout", `${CALLOUTS[type].cls}-title`)
                    title.innerText = CALLOUTS[type].title
                    el.appendChild(title)
                     el.appendChild(createElementFromHTML("<p></p>"))
                el.appendChild(createElementFromHTML(content)|| document.createElement("div"))
                }
                
            }


            preview.replaceChildren(temp);

  Prism.highlightAllUnder(preview);
        }


        function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
        }

        function submit(){
            updatePreview()

            let res = {"commit":commit.value,"type": type, "filename": filename.value, "md": editor.getValue(), "html": preview.innerHTML}
            fetch(`/-/api/create-page`, {method: 'POST',headers: {'Content-Type': 'application/json'},  body: JSON.stringify(res)})
                .then(response => {
                    if (response.ok) {
                        
                    }
                    else{
                        showToast(`Error (${response.status})`)
                    }

                })
        }
        function loadMd(){
          
            fetch(`/-/api/get-page?p=${path}`,{
			method:"GET",
            })
            .then(function(response){
                return response.text();
            })
            .then(function(data){
                editor.setValue(data)
                updatePreview()
            })
        }
        updatePreview();
        loadMd()

        function copyEvent(_this){
                navigator.clipboard.writeText(_this.dataset.text);
                _this.classList.toggle("copied")
                setTimeout(()=>{_this.classList.toggle("copied")}, 3000) 
        }
    

        function showToast(message = "Login failed", duration = 500000) {
            const toast = document.createElement("div");
            toast.classList.add("toast");
            toast.innerHTML = `
                <span>${message}</span>
                <span class="toast-close">&times;</span>
            `;

            document.getElementById("toast-container").appendChild(toast);

            setTimeout(() => {
                toast.classList.add("show");
            }, 100);

            const autoHide = setTimeout(() => {
                hideToast(toast);
            }, duration);

            toast.querySelector(".toast-close").addEventListener("click", () => {
                clearTimeout(autoHide); 
                hideToast(toast);
            });
        }

        function hideToast(toast) {
            toast.classList.remove("show");
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 400);
        }

