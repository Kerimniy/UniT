<h1 data-index>Admin Guide</h1>
<h3 data-index >Editing and creating pages</h3>
You can edit an existing page using the <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/edit_doc.svg"> at the top right of the page. If the button is missing, you lack the permissions to edit the page. 

To create a page use the <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/add.svg">.

<h4 data-index>Editor</h4>
In the editor you can set name of article and set commit name (not git, just message in history). In editor available search and replace. Preview updates automaticaly on edidor change (limit exist, so if something wrong write something and delete)

Editor supports HTML and Markdown

<h3 data-index >History</h3>
You can delete server history via <img style="height: 1em" src="/static/icons/history.svg"> <pre style="display: inline-block">History</pre>  ▶ <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/delete_history.svg"> at the top right of the page. 
To turn off the history press <img style="height: 1em" src="/static/icons/history.svg"> <pre style="display: inline-block">History</pre>  <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/history_off.svg"> button.

If the buttons are missing, you lack the permissions to edit the page. 

<h3 data-index>Renaming and Deleting</h3>
You can rename a page using <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/edit.svg">, then you will see text field for new name

A page can be deleted with  <img style="height: 1em" src="/static/icons/menu.svg"> ▶ <img style="height: 1em" src="/static/icons/delete.svg"> .
<div data-callout="caution">This deletion can't be reverted.</div> 

<h3 data-index>Page name</h3>
The page name can be anything that can be stored in the file system, with some sanitization: ?$.#\ and trailing slashes / will be removed.

<h3 data-index>Attachments</h3>
To add attachment you need to create file in "/static" directory. 

Example:

<img style="height: 1em" src="/static/icons/menu.svg"> 

is

`<img style="height: 1em" src="/static/icons/menu.svg">`

<h3 data-index>Subdirectories</h3>
You can create a page in a subdirectory by placing the name of the subdirectory before the page name separated by a slash. For example: Subdirectory/Page. For a better overview, a subdirectory has its own Page index.

Subdirectories can have subdirectories. The limit is given by file system's filename's length, because UniT doesn't create new dirs: filename is path+name of article. "/" will be replaced to "($)".

<h3 data-index>Server Settings</h3>
You can get into settings via <img style="height: 1em" src="/static/icons/settings.svg"><pre style="display: inline-block">Settings</pre>. You can set favicon, header-image, side-image, is history enabled, history limit, search limit, server name.

<br>
<br>
<br>
Good luck
<br>