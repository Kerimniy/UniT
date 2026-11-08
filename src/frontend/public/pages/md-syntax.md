
# Markdown Editor User Guide

## 1. Markdown Basics

Markdown is a simple plain-text format that allows you to create structured documents with headings, lists, links, images, and formatting.

### Headings

Headings are created using `#` symbols. The number of symbols determines the heading level.

Markdown:

```markdown
# Level 1 Heading
## Level 2 Heading
### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading
```

Result:

# Level 1 Heading
## Level 2 Heading
### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading

---

### Text Formatting

| Markdown | Result |
| :--- | :--- |
| `**Bold text**` | **Bold text** |
| `*Italic text*` | *Italic text* |
| `~~Strikethrough~~` | ~~Strikethrough~~ |
| `` `Monospace` `` | `Monospace` |
| `***Bold italic***` | ***Bold italic*** |

---

### Line Breaks and Paragraphs

A blank line between text creates a new paragraph.

Markdown:

```markdown
First paragraph.

Second paragraph.

Third line\
with a forced break.
```

Result:

First paragraph.

Second paragraph.

Third line\
with a forced break.

---

### Horizontal Rule

Used to visually separate sections of a document.

Markdown:

```markdown
Text before the divider.

---

Text after the divider.
```

Result:

Text before the divider.

---

Text after the divider.


## 2. Lists

### Unordered Lists

Use `-`, `*`, or `+` to create an unordered list.

Markdown:

```markdown
- First item
- Second item
- Third item
  - Nested item
  - Another nested item
```

Result:

- First item
- Second item
- Third item
  - Nested item
  - Another nested item

---

### Ordered Lists

Markdown:

```markdown
1. First item
2. Second item
3. Third item
```

Result:

1. First item
2. Second item
3. Third item

---

### Task Lists

GitHub Flavored Markdown (GFM) supports interactive checkboxes.

Markdown:

```markdown
- [x] Create project
- [x] Configure editor
- [ ] Write documentation
- [ ] Publish project
```

Result:

- [x] Create project
- [x] Configure editor
- [ ] Write documentation
- [ ] Publish project

---

## 3. Links and Images

### Links

Markdown:

```markdown
[Open GitHub](https://github.com)

https://example.com
```

Result:

[Open GitHub](https://github.com)

[https://example.com](https://example.com)

---

### Images

Images use an exclamation mark before the link syntax.

Markdown:

```markdown
![Image Description](/favicon.svg)
```

Result:

![Image Description](/favicon.svg)


---

## 4. Blockquotes

Use the `>` symbol to create blockquotes.

Markdown:

```markdown
> This is a standard blockquote.
>
> It can span multiple paragraphs.
>
> > Nested blockquotes are also supported.
```

Result:

> This is a standard blockquote.
>
> It can span multiple paragraphs.
>
> > Nested blockquotes are also supported.

---

## 5. GitHub Alerts — Info Blocks

The editor supports GitHub-style alerts for highlighting important information, warnings, and tips.

Syntax: `> [!TYPE]`

Supported types:

### NOTE
Markdown:
```markdown
> [!NOTE]
> Useful information that may be helpful to the reader.
```
Result:
> [!NOTE]
> Useful information that may be helpful to the reader.

### TIP
Markdown:
```markdown
> [!TIP]
> Use keyboard shortcuts to speed up your workflow.
```
Result:
> [!TIP]
> Use keyboard shortcuts to speed up your workflow.

### IMPORTANT
Markdown:
```markdown
> [!IMPORTANT]
> Make sure to save your changes before proceeding.
```
Result:
> [!IMPORTANT]
> Make sure to save your changes before proceeding.

### WARNING
Markdown:
```markdown
> [!WARNING]
> Incorrect configuration may lead to data loss.
```
Result:
> [!WARNING]
> Incorrect configuration may lead to data loss.

### CAUTION
Markdown:
```markdown
> [!CAUTION]
> This action is irreversible. Check all parameters carefully.
```
Result:
> [!CAUTION]
> This action is irreversible. Check all parameters carefully.

---

## 6. Tables

Tables allow you to structure data into rows and columns.

Markdown:

```markdown
| Language | Extension | Purpose |
|---|---|---|
| Go | `.go` | Backend |
| TypeScript | `.ts` | App Development |
| Rust | `.rs` | Systems Programming |
```

Result:

| Language | Extension | Purpose |
| :--- | :--- | :--- |
| Go | `.go` | Backend |
| TypeScript | `.ts` | App Development |
| Rust | `.rs` | Systems Programming |

Column alignment is also supported:

Markdown:

```markdown
| Left | Centered | Right |
|:---|:---:|---:|
| Text | Text | Text |
| 100 | 200 | 300 |
```

Result:

| Left | Centered | Right |
|:---|:---:|---:|
| Text | Text | Text |
| 100 | 200 | 300 |

---

## 7. Code Blocks and Syntax Highlighting

Use triple backticks to insert code blocks, optionally specifying the programming language.

Markdown:

````markdown
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello World!")
}
```
````

Result:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello World!")
}
```

### Supported Languages

| Language | Identifier |
| :--- | :--- |
| Go | `go` |
| Rust | `rust` |
| TypeScript | `typescript` or `ts` |
| JavaScript | `javascript` or `js` |
| Python | `python` or `py` |
| JSON | `json` |
| HTML | `html` |
| CSS | `css` |
| Bash | `bash` |
| SQL | `sql` |

### Inline Code

Use single backticks for short code snippets within text.

Markdown:

```markdown
To start the server, run `go run main.go`.
```

Result:

To start the server, run `go run main.go`.

---

## 8. Mathematical Formulas (LaTeX / KaTeX)

The editor supports LaTeX mathematical notation via KaTeX.

### Inline Formulas

Use single `$` signs.

Markdown:

```markdown
Einstein's famous formula: $E = mc^2$.
```

Result:

Einstein's famous formula: $E = mc^2$.

### Block Formulas

Use double `$$` signs.

Markdown:

```markdown
$$
D = b^2 - 4ac
$$
```

Result:

$$
D = b^2 - 4ac
$$

### Main LaTeX Commands

| Command | Result |
| :--- | :--- |
| `x^2` | $x^2$ |
| `x_1` | $x_1$ |
| `\frac{a}{b}` | $\frac{a}{b}$ |
| `\sqrt{x}` | $\sqrt{x}$ |
| `\sqrt[3]{x}` | $\sqrt[3]{x}$ |
| `\alpha` | $\alpha$ |
| `\beta` | $\beta$ |
| `\pi` | $\pi$ |
| `\infty` | $\infty$ |
| `\neq` | $\neq$ |
| `\leq` | $\leq$ |
| `\geq` | $\geq$ |

### Fractions

```markdown
$$
\frac{a+b}{c+d}
$$
```

$$
\frac{a+b}{c+d}
$$

### Sums and Integrals

```markdown
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\int_a^b f(x)\,dx
$$
```

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\int_a^b f(x)\,dx
$$

### Equation Systems

```markdown
$$
\begin{cases}
2x + y = 5 \\
x - y = 1
\end{cases}
$$
```

$$
\begin{cases}
2x + y = 5 \\
x - y = 1
\end{cases}
$$

### Matrices

```markdown
$$
A =
\begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
$$
```

$$
A =
\begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
$$

---

## 9. Inline HTML

The editor supports HTML markup directly within Markdown, allowing you to use elements for which no standard Markdown syntax exists.