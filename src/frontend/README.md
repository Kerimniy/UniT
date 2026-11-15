
> [!IMPORTANT]
> You have to change config.ts


# config.ts structure

```

export const REPO_BASE_URL = "https://codeberg.org/api/v1/repos/Kerimniy/test/raw" // path to repo raw sources 

export const PAGE_TITLE = "VEBVY-DEV" // base title
export const SIDEBAR_ICON_PATH ="/favicon.svg" // icon in bottom of sidevar
export const HEADER_ICON_PATH ="/favicon.svg" // icon in header

```

# Frontend structure

```
.
├── App.css
├── App.tsx
├── components
│   ├── Auth.tsx
│   ├── ContextMenu.tsx
│   ├── Image.tsx
│   ├── MarkdownRenderer.tsx
│   ├── PasswordInput.tsx
│   ├── ThemeToggle.tsx
│   └── ui
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── collapsible.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── popover.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── spinner.tsx
│       └── tooltip.tsx
├── config.ts
├── hooks
│   └── use-mobile.ts
├── index.css
├── lib
│   ├── caching.ts
│   ├── manage.ts
│   ├── monaco-setup.ts
│   ├── toc-store.ts
│   ├── user.ts
│   └── utils.ts
├── main.tsx
├── markdown.css
└── pages
    ├── AccountPage.tsx
    ├── AuthPage.tsx
    ├── Content.tsx
    ├── Editor.tsx
    ├── IndexPage.tsx
    └── Page.tsx

```
