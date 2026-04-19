
<h1 data-index>Markdown Guide</h1>


---

<br>

>[!TIP]
>To index headers you need to add data-index to html tag
> Example: `<h1 data-index>Chapter1</h1>`
>'Chapter1' will be added to navigation

<br>

<h2 data-index>Headings</h2>


Use # characters to create headings.

| Markdown | Preview |
| ---------------------------------------------- | ------------------------------------ |
| # Heading 1 <br> ## Heading 2 <br> ### Heading 3 <br> #### Heading 4 <br> ##### Heading 5 <br> ###### Heading 6 <br> | <h1>Heading 1</h1> <h2>Heading 2</h2> <h3>Heading 3</h3> <h4>Heading 4</h4> <h5>Heading 5</h5> <h6>Heading 6</h6> |
---


<h2 data-index>Emphasis</h2>


| Markdown                                                 | Preview             |
| -------------------------------------------------------- | -------------------- |
|<pre>&ast;italic&ast;<br>&ast;&ast;bold&ast;&ast; <br>&#126;&#126;strikethrough&#126;&#126;</pre>  | *italic*<br>**bold**<br>~~strikethrough~~ |

---

<h2 data-index>Lists</h2>



<h3 data-index>Unordered lists</h3>


| Markdown                                            | Preview                                |
| --------------------------------------------------- | --------------------------------------- |
| <br>- Item A<br>- Item B<br> <p style="margin:0; white-space: pre ">	- Nested item<br><p> | <ul><li>Item A</li><li>Item B<ul><li>Nested item</li></ul></li></ul> |


<h3 data-index>Ordered lists</h3>


| Markdown                                      | Preview                          |
| --------------------------------------------- | --------------------------------- |
| <br>1. List items <br> 2. in an ordered list <br> 3. numbered with numbers | <ol> <li>List items</li> <li>in an ordered list</li> <li>numbered with numbers</li> </ol> |

---


<h2 data-index>Links</h2>


| Markdown                                 | Preview                     |
| ---------------------------------------- | ---------------------------- |
| <br>	&lsqb;SiteName&rsqb;(https&colon;//example.com)<br><br> | <br> [SiteName](https://example.com) |

---


<h2 data-index>Images</h2>


| Markdown                           | Preview            |
| ---------------------------------- | ------------------- |
| <br>!&lsqb;Alt text](/static/icons/home.svg)<br> | <br> ![Alt text](/static/icons/home.svg) <br>|

---


<h2 data-index>Inline Code</h2>


| Markdown                                         | Preview                           |
| ------------------------------------------------ | ---------------------------------- |
| &grave;Code Blocks` | `Code Blocks` |

---


<h2 data-index>Code Blocks</h2>


Backticks with language name create fenced code blocks.

| Markdown                                                         | Preview                           |
| ---------------------------------------------------------------- | ---------------------------------- |
| &grave;`` rust <br>println!("Hello World!");<br>``` | <pre><code class="language-rust">println!("Hello World!");</code></pre> |

---



<h2 data-index>Blockquotes</h2>


Use &quot;&GT;&quot; to create blockquotes.

| Markdown                                        | Preview                            |
| ----------------------------------------------- | ----------------------------------- |
| > This is a quote<br>> on two lines<br> | <blockquote>This is a quote <br> on two lines</blockquote> |

---

<h2 data-index>GitHub-Style Admonitions (Custom)</h2>

This editor supports **GitHub-style admonitions** using blockquotes.

<h3 data-index>Supported types</h3>

* `NOTE`
* `TIP`
* `WARNING`
* `IMPORTANT`
* `CAUTION`

 
<h3 data-index>Syntax</h3>


| Markdown                                     | Preview                           |
| -------------------------------------------- | ---------------------------------- |
| <br>>[!NOTE]<br>>This is a note.<br>    | <div data-callout="note">This is a note.</div>    |
| <br>>[!WARNING]<br>>Be careful here.<br> |<div data-callout="warning">Be careful here.</div> |
| <br>>[!TIP]<br>>Useful advice.<br>      | <div data-callout="tip">Useful advice.</div>    |



 
<h4 data-index>Notes</h3>

* The marker **must be the first element** inside the blockquote
* Content may span multiple lines
* Formatting inside admonitions is supported
* <div data-callout="important">You can write &LT;div data-callout="note">This is a note.&LT;/div>
instead of 
>[!NOTE]
>This is a note.


</div>

---


<h2 data-index>Horizontal Lines</h2>


| Markdown        | Preview        |
| --------------- | --------------- |
| --- | <hr> |

---


<h2 data-index>Tables</h2>


<table>
<thead>
<tr>
<th>Markdown</th>
<th>Preview</th>
</tr>
</thead>
<tbody><tr>
<td style="vertical-align:middle"><div style="display: flex; flex-direction: column; width: 100%;">

  <div style="display: flex; justify-content: space-between; ">
    <span>|</span>
    <span>Column1</span>
    <span>|</span>
    <span>Column2</span>
    <span>|</span>
  </div>

  <div style="display: flex; justify-content: space-between;  ">
    <span>|</span>
    <span>Foo</span>
    <span>|</span>
    <span>Bar</span>
    <span>|</span>
  </div>

</div></td>
<td>

<table>
<thead>
<tr>
<th>Column1</th>
<th>Column2</th>
</tr>
</thead>
<tbody><tr>
<td>Foo</td>
<td>Bar</td>
</tr>
</tbody></table>

</td>
</tr>
</tbody></table>

---


<h2 data-index>Line Breaks</h2>


* A single newline inside text creates a soft break

| Markdown                              | Preview                  |
| ------------------------------------- | ------------------------- |
| First line&LT;br>Second line&LT;br> | First line<br>Second line<br> |

---
<br>



<h2 data-index>Remark</h2>

There's actually a lot more to Markdown than this. See the official <a href="http://daringfireball.net/projects/markdown/basics">introduction</a> and <a href="http://daringfireball.net/projects/markdown/syntax">syntax</a> for more information. Please Note: An Otter Wiki is not using the official implementation. This might lead to small differences in the little things.
